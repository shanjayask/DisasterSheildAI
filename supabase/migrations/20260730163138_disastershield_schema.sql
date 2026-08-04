/*
# DisasterShield AI — Core Schema

1. Purpose
- DisasterShield AI is a global disaster intelligence platform with user accounts.
- Each user owns private profile, family, report, and notification data.
- Public/shared reference tables (emergency contacts, historical disasters, shelters, hospitals, disaster events) are readable by everyone (anon + authenticated) but writable only by authenticated users where appropriate.

2. New Tables
- `profiles` — user personal + location + preference data (one row per user, keyed by user_id)
- `family_members` — household members for each user
- `emergency_contacts` — country-specific emergency numbers (reference data, public read)
- `disaster_events` — live/active disaster events (public read)
- `historical_disasters` — curated historical disaster records (public read)
- `disaster_reports` — user-submitted community reports (owner-scoped)
- `notifications` — per-user alert notifications (owner-scoped)
- `shelters` — emergency shelters (reference data, public read)
- `hospitals` — hospitals (reference data, public read)

3. Security
- RLS enabled on every table.
- Owner-scoped tables (profiles, family_members, disaster_reports, notifications): authenticated-only CRUD scoped to auth.uid() = user_id.
- Public reference tables (emergency_contacts, disaster_events, historical_disasters, shelters, hospitals): anon + authenticated SELECT; authenticated INSERT/UPDATE/DELETE where moderation is appropriate (disaster_reports owner-scoped).
- Owner columns default to auth.uid() so inserts omitting user_id still satisfy WITH CHECK.

4. Notes
- Uses gen_random_uuid() for primary keys.
- Timestamps default to now().
- Foreign keys cascade on user delete for owner-scoped tables.
*/

-- profiles: one row per authenticated user
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  age integer,
  gender text,
  country text,
  state text,
  city text,
  address text,
  latitude double precision,
  longitude double precision,
  approximate_location boolean DEFAULT false,
  preferred_language text DEFAULT 'en',
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_accessibility_needs text,
  shelter_radius_km integer DEFAULT 10,
  alert_severity_threshold text DEFAULT 'medium',
  profile_photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- family_members: household members per user
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer,
  gender text,
  relationship text,
  status text DEFAULT 'unknown',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_family" ON family_members;
CREATE POLICY "select_own_family" ON family_members FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_family" ON family_members;
CREATE POLICY "insert_own_family" ON family_members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_family" ON family_members;
CREATE POLICY "update_own_family" ON family_members FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_family" ON family_members;
CREATE POLICY "delete_own_family" ON family_members FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- emergency_contacts: country-specific reference data (public read)
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  service_name text NOT NULL,
  phone_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_emergency_contacts" ON emergency_contacts;
CREATE POLICY "read_emergency_contacts" ON emergency_contacts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_emergency_contacts" ON emergency_contacts;
CREATE POLICY "insert_emergency_contacts" ON emergency_contacts FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_emergency_contacts" ON emergency_contacts;
CREATE POLICY "update_emergency_contacts" ON emergency_contacts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- disaster_events: live/active events (public read)
CREATE TABLE IF NOT EXISTS disaster_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  latitude double precision,
  longitude double precision,
  severity text,
  title text,
  description text,
  source text,
  source_url text,
  event_time timestamptz,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE disaster_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_disaster_events" ON disaster_events;
CREATE POLICY "read_disaster_events" ON disaster_events FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_disaster_events" ON disaster_events;
CREATE POLICY "insert_disaster_events" ON disaster_events FOR INSERT
  TO authenticated WITH CHECK (true);

-- historical_disasters: curated historical records (public read)
CREATE TABLE IF NOT EXISTS historical_disasters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  event_name text NOT NULL,
  type text NOT NULL,
  country text,
  date text,
  death_toll text,
  latitude double precision,
  longitude double precision,
  source text,
  source_url text
);
ALTER TABLE historical_disasters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_historical_disasters" ON historical_disasters;
CREATE POLICY "read_historical_disasters" ON historical_disasters FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_historical_disasters" ON historical_disasters;
CREATE POLICY "insert_historical_disasters" ON historical_disasters FOR INSERT
  TO authenticated WITH CHECK (true);

-- disaster_reports: user-submitted community reports (owner-scoped)
CREATE TABLE IF NOT EXISTS disaster_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  latitude double precision,
  longitude double precision,
  description text,
  image_url text,
  verification_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE disaster_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reports" ON disaster_reports;
CREATE POLICY "select_own_reports" ON disaster_reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_reports" ON disaster_reports;
CREATE POLICY "insert_own_reports" ON disaster_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_reports" ON disaster_reports;
CREATE POLICY "update_own_reports" ON disaster_reports FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_reports" ON disaster_reports;
CREATE POLICY "delete_own_reports" ON disaster_reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- notifications: per-user alerts (owner-scoped)
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  severity text,
  acknowledged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- shelters: reference data (public read)
CREATE TABLE IF NOT EXISTS shelters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text,
  capacity text,
  status text,
  source text
);
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_shelters" ON shelters;
CREATE POLICY "read_shelters" ON shelters FOR SELECT
  TO anon, authenticated USING (true);

-- hospitals: reference data (public read)
CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text,
  phone text,
  source text
);
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_hospitals" ON hospitals;
CREATE POLICY "read_hospitals" ON hospitals FOR SELECT
  TO anon, authenticated USING (true);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_disaster_reports_user_id ON disaster_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_disaster_events_type ON disaster_events(type);
CREATE INDEX IF NOT EXISTS idx_historical_disasters_year ON historical_disasters(year);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_country ON emergency_contacts(country);
