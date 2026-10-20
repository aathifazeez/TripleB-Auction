-- ───────────────────────────────────────────────────────────────
-- Triple B Premier League Auction — Full schema
-- Run this once in a FRESH Supabase project's SQL Editor.
-- Idempotent: safe to re-run.
-- ───────────────────────────────────────────────────────────────

-- 1) Tables ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.teams (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  logo_url    text,
  color_hex   text DEFAULT '#1a1a2e',
  budget      integer NOT NULL,
  budget_used integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.players (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  photo_url     text,
  role          text CHECK (role IN ('batsman', 'bowler', 'allrounder', 'wicketkeeper')),
  base_points   integer NOT NULL,
  status        text DEFAULT 'pending' CHECK (status IN ('pending', 'sold', 'unsold')),
  team_id       uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  sold_for      integer,
  auction_order integer,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.auction_state (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status             text DEFAULT 'idle' CHECK (status IN ('idle', 'rolling', 'bidding', 'sold', 'ended')),
  current_player_id  uuid REFERENCES public.players(id) ON DELETE SET NULL,
  current_bid        integer DEFAULT 0,
  current_bid_team   uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  next_min_bid       integer DEFAULT 0,
  updated_at         timestamptz DEFAULT now()
);

-- 2) Singleton auction_state (at most one row, ever) ─────────

CREATE UNIQUE INDEX IF NOT EXISTS auction_state_singleton
ON public.auction_state ((true));

INSERT INTO public.auction_state (status)
SELECT 'idle'
WHERE NOT EXISTS (SELECT 1 FROM public.auction_state);

-- 3) updated_at trigger (realtime payload depends on this) ───

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auction_state_set_updated_at ON public.auction_state;
CREATE TRIGGER auction_state_set_updated_at
BEFORE UPDATE ON public.auction_state
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4) Realtime publication ─────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'auction_state'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_state;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'teams'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
  END IF;
END $$;

-- 5) Row Level Security — public read, writes via service role only ─

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read teams" ON public.teams;
CREATE POLICY "public read teams" ON public.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read players" ON public.players;
CREATE POLICY "public read players" ON public.players FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read auction_state" ON public.auction_state;
CREATE POLICY "public read auction_state" ON public.auction_state FOR SELECT USING (true);

-- No INSERT/UPDATE/DELETE policies are defined for anon/authenticated,
-- so writes only succeed via the service role key (used server-side
-- in the Next.js API routes under app/api/).

-- 6) Storage bucket for player photos ─────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('player-photos', 'player-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public read player-photos" ON storage.objects;
CREATE POLICY "public read player-photos" ON storage.objects
FOR SELECT USING (bucket_id = 'player-photos');

-- Sanity check ─────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM public.auction_state) AS auction_state_rows,
  (SELECT COUNT(*) FROM public.players)       AS players_rows,
  (SELECT COUNT(*) FROM public.teams)         AS teams_rows;
