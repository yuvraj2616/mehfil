-- ============================================================
-- Mehfil Database Schema
-- All 6 tables + RLS policies + Auth trigger
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES — every registered user
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  name       TEXT NOT NULL DEFAULT '',
  phone      TEXT DEFAULT '',
  role       TEXT NOT NULL DEFAULT 'attendee' CHECK (role IN ('admin', 'organizer', 'artist', 'attendee')),
  avatar     TEXT DEFAULT '',
  bio        TEXT DEFAULT '',
  city       TEXT DEFAULT '',
  state      TEXT DEFAULT '',
  country    TEXT DEFAULT '',
  lat        DOUBLE PRECISION DEFAULT NULL,
  lng        DOUBLE PRECISION DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. EVENTS — cultural events
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id  UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'cultural' CHECK (category IN ('poetry', 'music', 'dance', 'theater', 'cultural', 'literary', 'comedy')),
  tags          TEXT[] DEFAULT '{}',
  date_time     JSONB DEFAULT '{}',
  venue         JSONB DEFAULT '{}',
  artists       JSONB DEFAULT '[]',
  ticketing     JSONB DEFAULT '[]',
  finances      JSONB DEFAULT '{}',
  media         JSONB DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  is_featured   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. BOOKINGS — ticket purchases
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      TEXT NOT NULL UNIQUE DEFAULT ('BK' || SUBSTRING(gen_random_uuid()::text, 1, 10)),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendee_id     UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  tickets         JSONB DEFAULT '[]',
  total_amount    NUMERIC(10, 2) DEFAULT 0,
  final_amount    NUMERIC(10, 2) DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  payment_details JSONB DEFAULT '{}',
  check_in        JSONB DEFAULT '{}',
  expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes'),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. PAYMENTS — financial transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      TEXT NOT NULL UNIQUE DEFAULT ('PAY' || SUBSTRING(gen_random_uuid()::text, 1, 10)),
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  payer_id        UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  amount          NUMERIC(10, 2) NOT NULL DEFAULT 0,
  net_amount      NUMERIC(10, 2) DEFAULT 0,
  payment_method  TEXT DEFAULT '' CHECK (payment_method IN ('', 'card', 'upi', 'netbanking', 'wallet')),
  gateway         JSONB DEFAULT '{}',
  processing_fee  NUMERIC(10, 2) DEFAULT 0,
  platform_fee    NUMERIC(10, 2) DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. REVIEWS — event feedback
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reviewer_id         UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  ratings             JSONB DEFAULT '{"overall": 0, "venue": 0, "performance": 0, "value": 0}',
  title               TEXT DEFAULT '',
  content             TEXT DEFAULT '',
  pros                TEXT[] DEFAULT '{}',
  cons                TEXT[] DEFAULT '{}',
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful_votes       INTEGER DEFAULT 0,
  total_votes         INTEGER DEFAULT 0,
  organizer_response  JSONB DEFAULT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. SPONSORS — event sponsors
-- ============================================================
CREATE TABLE IF NOT EXISTS sponsors (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name        TEXT NOT NULL,
  logo                TEXT DEFAULT '',
  website             TEXT DEFAULT '',
  sponsorship_tier    TEXT DEFAULT 'community' CHECK (sponsorship_tier IN ('title', 'presenting', 'supporting', 'community')),
  sponsored_event_ids UUID[] DEFAULT '{}',
  total_amount        NUMERIC(10, 2) DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_bookings_attendee ON bookings(attendee_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_event ON reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- EVENTS policies
CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  USING (status = 'published' OR organizer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Organizers and admins can create events"
  ON events FOR INSERT
  WITH CHECK (
    organizer_id = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

CREATE POLICY "Organizers can update own events, admins can update any"
  ON events FOR UPDATE
  USING (
    organizer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Organizers can delete own events, admins can delete any"
  ON events FOR DELETE
  USING (
    organizer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- BOOKINGS policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (
    attendee_id = auth.uid() OR EXISTS (
      SELECT 1 FROM events WHERE events.id = bookings.event_id AND events.organizer_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = attendee_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  USING (attendee_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- PAYMENTS policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    payer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = payer_id);

-- REVIEWS policies
CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (
    status = 'approved' OR reviewer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Admins and organizers can moderate reviews"
  ON reviews FOR UPDATE
  USING (
    reviewer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'organizer')
    )
  );

-- SPONSORS policies
CREATE POLICY "Anyone can view sponsors"
  ON sponsors FOR SELECT
  USING (true);

CREATE POLICY "Admins and organizers can manage sponsors"
  ON sponsors FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'organizer')
  ));

CREATE POLICY "Admins and organizers can update sponsors"
  ON sponsors FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'organizer')
  ));

-- ============================================================
-- AUTH TRIGGER: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
