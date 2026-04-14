-- ============================================================
-- Futsal Stats — Supabase Schema
-- Execute no SQL Editor do seu projeto Supabase
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

-- 3. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------

ALTER TABLE public.teams            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;

-- Teams: só o dono acessa
CREATE POLICY "teams_owner"
  ON public.teams FOR ALL
  USING (auth.uid() = owner_id);

-- Players: acessa quem é dono do time
CREATE POLICY "players_owner"
  ON public.players FOR ALL
  USING (team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid()));

-- Matches
CREATE POLICY "matches_owner"
  ON public.matches FOR ALL
  USING (team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid()));

-- Match events: acessa quem é dono da partida
CREATE POLICY "match_events_owner"
  ON public.match_events FOR ALL
  USING (
    match_id IN (
      SELECT m.id FROM public.matches m
      JOIN public.teams t ON m.team_id = t.id
      WHERE t.owner_id = auth.uid()
    )
  );

-- Financial entries
CREATE POLICY "financial_owner"
  ON public.financial_entries FOR ALL
  USING (team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid()));

-- 4. TRIGGER: cria time padrão ao criar usuário
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.teams (owner_id, name)
  VALUES (NEW.id, 'Meu Time');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
