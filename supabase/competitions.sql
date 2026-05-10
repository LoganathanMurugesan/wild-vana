-- Photography Competitions Feature
-- Run this after schema.sql

-- ============================================================
-- STORAGE
-- In Supabase dashboard: Storage > New Bucket
--   Name: competition-photos
--   Public: true
-- Then run the policies below.
-- ============================================================

CREATE POLICY "Public read competition photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'competition-photos');

CREATE POLICY "Public upload competition photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'competition-photos');

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS competitions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  theme       text,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  status      text NOT NULL DEFAULT 'upcoming'
              CHECK (status IN ('upcoming', 'active', 'judging', 'closed')),
  cover_image text,
  created_at  timestamptz DEFAULT now()
);

-- One global registration per email (participant registers once)
CREATE TABLE IF NOT EXISTS competition_registrations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  email         text NOT NULL UNIQUE,
  phone         text,
  tour_attended text,
  created_at    timestamptz DEFAULT now()
);

-- One photo entry per person per competition
CREATE TABLE IF NOT EXISTS competition_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id  uuid NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  registration_id uuid NOT NULL REFERENCES competition_registrations(id) ON DELETE CASCADE,
  photo_url       text NOT NULL,
  title           text,
  caption         text,
  submitted_at    timestamptz DEFAULT now(),
  UNIQUE(competition_id, registration_id)
);

-- Winners / Hall of Fame (ranks 1, 2, 3 per competition)
CREATE TABLE IF NOT EXISTS competition_winners (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id       uuid NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  registration_id      uuid NOT NULL REFERENCES competition_registrations(id) ON DELETE CASCADE,
  rank                 integer NOT NULL CHECK (rank IN (1, 2, 3)),
  discount_code        text UNIQUE,
  discount_valid_until date,
  announced_at         timestamptz DEFAULT now(),
  UNIQUE(competition_id, rank)
);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE competitions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_winners       ENABLE ROW LEVEL SECURITY;

-- competitions: public read, admin write
CREATE POLICY "Public read competitions"
  ON competitions FOR SELECT USING (true);
CREATE POLICY "Admin manage competitions"
  ON competitions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- registrations: public insert + read, admin full
CREATE POLICY "Public register"
  ON competition_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read registrations"
  ON competition_registrations FOR SELECT USING (true);
CREATE POLICY "Admin manage registrations"
  ON competition_registrations FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- entries: public read + insert, admin full
CREATE POLICY "Public read entries"
  ON competition_entries FOR SELECT USING (true);
CREATE POLICY "Public submit entries"
  ON competition_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage entries"
  ON competition_entries FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- winners: public read, admin full
CREATE POLICY "Public read winners"
  ON competition_winners FOR SELECT USING (true);
CREATE POLICY "Admin manage winners"
  ON competition_winners FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
