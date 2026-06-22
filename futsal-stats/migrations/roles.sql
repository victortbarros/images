-- ============================================================
-- Futsal Stats — Perfis de Acesso (time compartilhado)
-- Execute UMA vez no SQL Editor do Supabase.
-- Idempotente: pode rodar de novo sem quebrar.
-- ============================================================
-- Papéis:
--   admin   -> "Gestor do Time": controle total, inclui financeiro
--   gestor  -> edita elenco e partidas, SEM financeiro
--   leitura -> vê tudo MENOS financeiro, não edita
-- ============================================================

-- 1. NOVAS TABELAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id    UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('admin','gestor','leitura')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.team_invites (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id    UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('admin','gestor','leitura')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS team_members_user_idx ON public.team_members (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS team_invites_team_email_idx ON public.team_invites (team_id, lower(email));

-- 2. BACKFILL: dono atual de cada time vira admin
-- ------------------------------------------------------------
INSERT INTO public.team_members (team_id, user_id, role)
SELECT id, owner_id, 'admin' FROM public.teams
ON CONFLICT (team_id, user_id) DO NOTHING;

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

-- 4. RLS NAS NOVAS TABELAS
-- ------------------------------------------------------------
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_select"       ON public.team_members;
DROP POLICY IF EXISTS "members_admin_insert" ON public.team_members;
DROP POLICY IF EXISTS "members_admin_update" ON public.team_members;
DROP POLICY IF EXISTS "members_admin_delete" ON public.team_members;

CREATE POLICY "members_select" ON public.team_members
  FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "members_admin_insert" ON public.team_members
  FOR INSERT WITH CHECK (public.team_role(team_id) = 'admin');
CREATE POLICY "members_admin_update" ON public.team_members
  FOR UPDATE USING (public.team_role(team_id) = 'admin')
         WITH CHECK (public.team_role(team_id) = 'admin');
CREATE POLICY "members_admin_delete" ON public.team_members
  FOR DELETE USING (public.team_role(team_id) = 'admin');

DROP POLICY IF EXISTS "invites_select"       ON public.team_invites;
DROP POLICY IF EXISTS "invites_admin_insert" ON public.team_invites;
DROP POLICY IF EXISTS "invites_admin_delete" ON public.team_invites;

CREATE POLICY "invites_select" ON public.team_invites
  FOR SELECT USING (
    public.team_role(team_id) = 'admin'
    OR lower(email) = lower(auth.jwt() ->> 'email')
  );
CREATE POLICY "invites_admin_insert" ON public.team_invites
  FOR INSERT WITH CHECK (public.team_role(team_id) = 'admin');
CREATE POLICY "invites_admin_delete" ON public.team_invites
  FOR DELETE USING (public.team_role(team_id) = 'admin');

-- 5. REESCREVE POLICIES DAS TABELAS EXISTENTES
-- ------------------------------------------------------------
-- TEAMS
DROP POLICY IF EXISTS "teams_owner"         ON public.teams;
DROP POLICY IF EXISTS "teams_select"        ON public.teams;
DROP POLICY IF EXISTS "teams_insert_own"    ON public.teams;
DROP POLICY IF EXISTS "teams_admin_update"  ON public.teams;
DROP POLICY IF EXISTS "teams_admin_delete"  ON public.teams;

CREATE POLICY "teams_select" ON public.teams
  FOR SELECT USING (public.is_team_member(id));
CREATE POLICY "teams_insert_own" ON public.teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "teams_admin_update" ON public.teams
  FOR UPDATE USING (public.team_role(id) = 'admin')
         WITH CHECK (public.team_role(id) = 'admin');
CREATE POLICY "teams_admin_delete" ON public.teams
  FOR DELETE USING (public.team_role(id) = 'admin');

-- PLAYERS
DROP POLICY IF EXISTS "players_owner"  ON public.players;
DROP POLICY IF EXISTS "players_select" ON public.players;
DROP POLICY IF EXISTS "players_insert" ON public.players;
DROP POLICY IF EXISTS "players_update" ON public.players;
DROP POLICY IF EXISTS "players_delete" ON public.players;

CREATE POLICY "players_select" ON public.players
  FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "players_insert" ON public.players
  FOR INSERT WITH CHECK (public.team_role(team_id) IN ('admin','gestor'));
CREATE POLICY "players_update" ON public.players
  FOR UPDATE USING (public.team_role(team_id) IN ('admin','gestor'))
         WITH CHECK (public.team_role(team_id) IN ('admin','gestor'));
CREATE POLICY "players_delete" ON public.players
  FOR DELETE USING (public.team_role(team_id) IN ('admin','gestor'));

-- MATCHES
DROP POLICY IF EXISTS "matches_owner"  ON public.matches;
DROP POLICY IF EXISTS "matches_select" ON public.matches;
DROP POLICY IF EXISTS "matches_insert" ON public.matches;
DROP POLICY IF EXISTS "matches_update" ON public.matches;
DROP POLICY IF EXISTS "matches_delete" ON public.matches;

CREATE POLICY "matches_select" ON public.matches
  FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "matches_insert" ON public.matches
  FOR INSERT WITH CHECK (public.team_role(team_id) IN ('admin','gestor'));
CREATE POLICY "matches_update" ON public.matches
  FOR UPDATE USING (public.team_role(team_id) IN ('admin','gestor'))
         WITH CHECK (public.team_role(team_id) IN ('admin','gestor'));
CREATE POLICY "matches_delete" ON public.matches
  FOR DELETE USING (public.team_role(team_id) IN ('admin','gestor'));

-- MATCH_EVENTS (papel herdado da partida)
DROP POLICY IF EXISTS "match_events_owner"  ON public.match_events;
DROP POLICY IF EXISTS "match_events_select" ON public.match_events;
DROP POLICY IF EXISTS "match_events_insert" ON public.match_events;
DROP POLICY IF EXISTS "match_events_update" ON public.match_events;
DROP POLICY IF EXISTS "match_events_delete" ON public.match_events;

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

-- FINANCIAL_ENTRIES (somente admin)
DROP POLICY IF EXISTS "financial_owner"     ON public.financial_entries;
DROP POLICY IF EXISTS "financial_admin_all" ON public.financial_entries;

CREATE POLICY "financial_admin_all" ON public.financial_entries
  FOR ALL USING (public.team_role(team_id) = 'admin')
          WITH CHECK (public.team_role(team_id) = 'admin');

-- 6. TRIGGER: novo usuário ganha time pessoal + membership admin
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
-- (trigger on_auth_user_created já existe e aponta para esta função)

-- 7. ACEITAR CONVITES (auto-join por email)
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

-- 8. LISTAR MEMBROS COM EMAIL (clientes não leem auth.users direto)
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

-- 9. PERMISSÕES DE EXECUÇÃO
-- ------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.is_team_member(UUID)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.team_role(UUID)        TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invites()       TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_members(UUID) TO authenticated;
