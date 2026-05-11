-- ============================================================
-- Wild Vana — Analytics Events Table
-- Lightweight custom event tracking for the admin dashboard.
-- GA4 handles sessions / geography / devices externally.
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    text        NOT NULL,     -- page_view | tour_view | booking_click | competition_register | section_view
  page          text,                     -- URL path  e.g. /tours/abc-123
  tour_id       uuid        REFERENCES tours(id) ON DELETE SET NULL,
  tour_location text,                     -- e.g. "Ranthambore"
  referrer      text,                     -- document.referrer
  user_agent    text,                     -- navigator.userAgent
  session_id    text,                     -- anonymous UUID stored in sessionStorage
  created_at    timestamptz DEFAULT now()
);

-- Index for fast admin queries
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_type_idx       ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS analytics_events_session_idx    ON analytics_events (session_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Public can INSERT (track own visit) — no personal data stored
CREATE POLICY "Public insert analytics"
  ON analytics_events FOR INSERT WITH CHECK (true);

-- Only admin can read
CREATE POLICY "Admin read analytics"
  ON analytics_events FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
