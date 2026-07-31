/*
# Cultural Events Platform — Core Schema

1. Overview
This migration creates the full data model for a location-based cultural events platform.
The map is publicly browsable without login, so events are readable by anon + authenticated.
Personal features (favorites, participations, reminders, ratings) are owner-scoped to the
authenticated user. Event creation requires authentication; new/unknown organizers' events
start in a "pending" status for quick approval.

2. New Tables
- `events`: cultural activities shown on the map. Public read; owner-scoped write.
  - id (uuid pk)
  - title (text, not null)
  - description (text, not null)
  - category (text, not null) — e.g. Música, Dança, Teatro, Literatura, Gastronomia, Artesanato, Tecnologia, Cultura Geek
  - address (text, nullable — null for virtual-only events)
  - latitude (double precision, nullable)
  - longitude (double precision, nullable)
  - images (text[], default '{}') — image URLs
  - start_time (timestamptz, not null)
  - end_time (timestamptz, nullable)
  - is_free (boolean, default true)
  - is_virtual (boolean, default false)
  - virtual_link (text, nullable) — link for live stream / call / voice room
  - participation_info (text, nullable) — instructions on how to join
  - organizer_name (text, not null)
  - is_ai_generated (boolean, default false) — visually distinguishes AI-discovered cards
  - source_url (text, nullable) — where the AI found the event
  - status (text, default 'active') — pending | active | cancelled
  - user_id (uuid, nullable, default auth.uid()) — owner; null for AI-discovered events
  - created_at (timestamptz, default now())
  - updated_at (timestamptz, default now())

- `favorites`: events a user has favorited. Owner-scoped.
  - id (uuid pk)
  - user_id (uuid, default auth.uid())
  - event_id (uuid, fk events)
  - created_at

- `participations`: events a user marked "Já participei". Owner-scoped.
  - id (uuid pk)
  - user_id (uuid, default auth.uid())
  - event_id (uuid, fk events)
  - created_at

- `reminders`: scheduled reminders for events. Owner-scoped.
  - id (uuid pk)
  - user_id (uuid, default auth.uid())
  - event_id (uuid, fk events)
  - minutes_before (integer, default 60) — how many minutes before start to notify
  - created_at

- `ratings`: user ratings for events after participation. Owner-scoped, one per user per event.
  - id (uuid pk)
  - user_id (uuid, default auth.uid())
  - event_id (uuid, fk events)
  - rating (integer, 1-5, not null)
  - comment (text, nullable)
  - created_at

3. Indexes
- events(status), events(category), events(is_free), events(is_virtual),
  events(start_time), events(user_id), events(latitude, longitude) for proximity queries.
- Unique indexes on (user_id, event_id) for favorites, participations, reminders, ratings.

4. Security (RLS)
- events: SELECT open to anon + authenticated (public map). INSERT/UPDATE/DELETE for
  authenticated owners only (user_id = auth.uid()).
- favorites / participations / reminders / ratings: full owner-scoped CRUD for authenticated.

5. Notes
- `user_id` on events defaults to auth.uid() so authenticated inserts that omit it still pass
  the WITH CHECK policy. AI-discovered events are inserted server-side with a null user_id.
- Events with status 'pending' are still readable so organizers can preview; the frontend can
  filter them for non-owners.
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  address text,
  latitude double precision,
  longitude double precision,
  images text[] NOT NULL DEFAULT '{}',
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  is_free boolean NOT NULL DEFAULT true,
  is_virtual boolean NOT NULL DEFAULT false,
  virtual_link text,
  participation_info text,
  organizer_name text NOT NULL,
  is_ai_generated boolean NOT NULL DEFAULT false,
  source_url text,
  status text NOT NULL DEFAULT 'active',
  user_id uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select_public" ON events;
CREATE POLICY "events_select_public" ON events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "events_insert_own" ON events;
CREATE POLICY "events_insert_own" ON events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "events_update_own" ON events;
CREATE POLICY "events_update_own" ON events FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "events_delete_own" ON events;
CREATE POLICY "events_delete_own" ON events FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_is_free ON events(is_free);
CREATE INDEX IF NOT EXISTS idx_events_is_virtual ON events(is_virtual);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select_own" ON favorites;
CREATE POLICY "favorites_select_own" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert_own" ON favorites;
CREATE POLICY "favorites_insert_own" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete_own" ON favorites;
CREATE POLICY "favorites_delete_own" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE participations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participations_select_own" ON participations;
CREATE POLICY "participations_select_own" ON participations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "participations_insert_own" ON participations;
CREATE POLICY "participations_insert_own" ON participations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "participations_delete_own" ON participations;
CREATE POLICY "participations_delete_own" ON participations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  minutes_before integer NOT NULL DEFAULT 60,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reminders_select_own" ON reminders;
CREATE POLICY "reminders_select_own" ON reminders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reminders_insert_own" ON reminders;
CREATE POLICY "reminders_insert_own" ON reminders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reminders_delete_own" ON reminders;
CREATE POLICY "reminders_delete_own" ON reminders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ratings_select_own" ON ratings;
CREATE POLICY "ratings_select_own" ON ratings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ratings_insert_own" ON ratings;
CREATE POLICY "ratings_insert_own" ON ratings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ratings_update_own" ON ratings;
CREATE POLICY "ratings_update_own" ON ratings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ratings_delete_own" ON ratings;
CREATE POLICY "ratings_delete_own" ON ratings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);