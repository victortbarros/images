-- ============================================================
-- Futsal Stats — Supabase Schema (completo, com perfis de acesso)
-- Execute no SQL Editor do seu projeto Supabase (instalação nova).
-- Para um banco que já existe, rode migrations/roles.sql.
-- ============================================================
-- Papéis (team_members.role):
--   admin   -> "Gestor do Time": controle total, inclui financeiro
--   gestor  -> edita elenco e partidas, SEM financeiro
--   leitura -> vê tudo MENOS financeiro, não edita
-- ============================================================

-- 1. TABELAS
-- ------------------------------------------------------------
CREATE TABLE public.teams (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL DEFAULT 'Futsal Stats',
  logo       TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.team_members (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id    UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('admin','gestor','leitura')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (team_id, user_id)
);

CREATE TABLE public.team_invites (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id    UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('admin','gestor','leitura')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.players (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id    UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  number     INTEGER NOT NULL,
  position   TEXT NOT NULL,
  quadros    TEXT[] NOT NULL DEFAULT ARRAY['Quadro 1'],
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.matches (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id     UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  date        DATE NOT NULL,
  opponent    TEXT NOT NULL,
  venue       TEXT NOT NULL DEFAULT 'home',
  competition TEXT NOT NULL DEFAULT '',
  our_score   INTEGER NOT NULL DEFAULT 0,
  their_score INTEGER NOT NULL DEFAULT 0,
  notes       TEXT NOT NULL DEFAULT '',
  quadro      TEXT NOT NULL DEFAULT 'Quadro 1',
  presences   UUID[] NOT NULL DEFAULT '{}',
  starters    UUID[] NOT NULL DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'draft',
  mvp_player_id UUID,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- player_id sem FK intencional: preserva eventos de jogadores inativos
CREATE TABLE public.match_events (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id   UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  player_id  UUID NOT NULL,
  type       TEXT NOT NULL,
  minute     INTEGER,
  value      INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.financial_entries (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id     UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category    TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  amount      DECIMAL(10,2) NOT NULL,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. ÍNDICES
-- ------------------------------------------------------------
CREATE INDEX ON public.players (team_id);
CREATE INDEX ON public.matches (team_id, date DESC);
CREATE INDEX ON public.match_events (match_id);
CREATE INDEX ON public.financial_entries (team_id, date DESC);
CREATE INDEX ON public.team_members (user_id);
CREATE UNIQUE INDEX team_invites_team_email_idx ON public.team_invites (team_id, lower(email));

-- 3. FUNÇÕES HELPER (SECURITY DEFINER evita recursão de RLS)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_team_member(tid UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = tid AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.team_role(tid UUID)
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT role FROM public.team_members
  WHERE team_id = tid AND user_id = auth.uid()
  LIMIT 1;
$$;

-- 4. ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE public.teams             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;

-- team_members
CREATE POLICY "members_select" ON public.team_members
  FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "members_admin_insert" ON public.team_members
  FOR INSERT WITH CHECK (public.team_role(team_id) = 'admin');
CREATE POLICY "members_admin_update" ON public.team_members
  FOR UPDATE USING (public.team_role(team_id) = 'admin')
         WITH CHECK (public.team_role(team_id) = 'admin');
CREATE POLICY "members_admin_delete" ON public.team_members
  FOR DELETE USING (public.team_role(team_id) = 'admin');

-- team_invites
CREATE POLICY "invites_select" ON public.team_invites
  FOR SELECT USING (
    public.team_role(team_id) = 'admin'
    OR lower(email) = lower(auth.jwt() ->> 'email')
  );
CREATE POLICY "invites_admin_insert" ON public.team_invites
  FOR INSERT WITH CHECK (public.team_role(team_id) = 'admin');
CREATE POLICY "invites_admin_delete" ON public.team_invites
  FOR DELETE USING (public.team_role(team_id) = 'admin');

-- teams
CREATE POLICY "teams_select" ON public.teams
  FOR SELECT USING (public.is_team_member(id));
CREATE POLICY "teams_insert_own" ON public.teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "teams_admin_update" ON public.teams
  FOR UPDATE USING (public.team_role(id) = 'admin')
         WITH CHECK (public.team_role(id) = 'admin');
CREATE POLICY "teams_admin_delete" ON public.teams
  FOR DELETE USING (public.team_role(id) = 'admin');

-- players
CREATE POLICY "players_select" ON public.players
  FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "players_insert" ON public.players
  FOR INSERT WITH CHECK (public.team_role(team_id) IN ('admin','gestor'));
CREATE POLICY "players_update" ON public.players
  FOR UPDATE USING (public.team_role(team_id) IN ('admin','gestor'))
         WITH CHECK (public.team_role(team_id) IN ('admin','gestor'));
CREATE POLICY "players_delete" ON public.players
  FOR DELETE USING (public.team_role(team_id) IN ('admin','gestor'));

-- matches
CREATE POLICY "matches_select" ON public.matches
  FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "matches_insert" ON public.matches
  FOR INSERT WITH CHECK (public.team_role(team_id) IN ('admin','gestor'));
CREATE POLICY "matches_update" ON public.matches
  FOR UPDATE USING (public.team_role(team_id) IN ('admin','gestor'))
         WITH CHECK (public.team_role(team_id) IN ('admin','gestor'));
CREATE POLICY "matches_delete" ON public.matches
  FOR DELETE USING (public.team_role(team_id) IN ('admin','gestor'));

-- match_events (papel herdado da partida)
CREATE POLICY "match_events_select" ON public.match_events
  FOR SELECT USING (
    public.is_team_member((SELECT team_id FROM public.matches WHERE id = match_id))
  );
CREATE POLICY "match_events_insert" ON public.match_events
  FOR INSERT WITH CHECK (
    public.team_role((SELECT team_id FROM public.matches WHERE id = match_id)) IN ('admin','gestor')
  );
CREATE POLICY "match_events_update" ON public.match_events
  FOR UPDATE USING (
    public.team_role((SELECT team_id FROM public.matches WHERE id = match_id)) IN ('admin','gestor')
  );
CREATE POLICY "match_events_delete" ON public.match_events
  FOR DELETE USING (
    public.team_role((SELECT team_id FROM public.matches WHERE id = match_id)) IN ('admin','gestor')
  );

-- financial_entries (somente admin)
CREATE POLICY "financial_admin_all" ON public.financial_entries
  FOR ALL USING (public.team_role(team_id) = 'admin')
          WITH CHECK (public.team_role(team_id) = 'admin');

-- 5. TRIGGER: novo usuário ganha time pessoal + membership admin
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_team_id UUID;
BEGIN
  INSERT INTO public.teams (owner_id, name)
  VALUES (NEW.id, 'Meu Time')
  RETURNING id INTO new_team_id;

  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (new_team_id, NEW.id, 'admin');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. ACEITAR CONVITES (auto-join por email)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.accept_invites()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uemail TEXT;
BEGIN
  SELECT lower(email) INTO uemail FROM auth.users WHERE id = auth.uid();
  IF uemail IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.team_members (team_id, user_id, role)
  SELECT i.team_id, auth.uid(), i.role
  FROM public.team_invites i
  WHERE lower(i.email) = uemail
  ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  DELETE FROM public.team_invites i WHERE lower(i.email) = uemail;
END;
$$;

-- 7. LISTAR MEMBROS COM EMAIL
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_team_members(tid UUID)
RETURNS TABLE (user_id UUID, email TEXT, role TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_team_member(tid) THEN
    RETURN;
  END IF;
  RETURN QUERY
    SELECT tm.user_id, u.email::TEXT, tm.role, tm.created_at
    FROM public.team_members tm
    JOIN auth.users u ON u.id = tm.user_id
    WHERE tm.team_id = tid
    ORDER BY tm.created_at;
END;
$$;

-- 8. PERMISSÕES DE EXECUÇÃO
-- ------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.is_team_member(UUID)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.team_role(UUID)        TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invites()       TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_members(UUID) TO authenticated;
