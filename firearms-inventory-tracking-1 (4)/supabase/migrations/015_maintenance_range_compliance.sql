-- Maintenance Records Table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('firearm', 'optic', 'suppressor')),
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('cleaning', 'repair', 'upgrade', 'inspection', 'parts_replacement', 'other')),
  date_performed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  performed_by TEXT,
  cost DECIMAL(10,2),
  notes TEXT,
  parts_used JSONB DEFAULT '[]'::jsonb,
  next_service_date DATE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Range Session Records Table
CREATE TABLE IF NOT EXISTS range_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT NOT NULL,
  duration_minutes INTEGER,
  firearm_id UUID,
  rounds_fired INTEGER NOT NULL DEFAULT 0,
  ammo_type TEXT,
  distance_yards INTEGER,
  target_type TEXT,
  accuracy_notes TEXT,
  weather_conditions TEXT,
  temperature_f INTEGER,
  wind_speed_mph INTEGER,
  performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5),
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Compliance Documents Table
CREATE TABLE IF NOT EXISTS compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID,
  item_type TEXT CHECK (item_type IN ('firearm', 'optic', 'suppressor', 'general')),
  document_type TEXT NOT NULL CHECK (document_type IN ('atf_form', 'permit', 'license', 'transfer', 'registration', 'insurance', 'other')),
  document_number TEXT,
  issue_date DATE,
  expiration_date DATE,
  issuing_authority TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'revoked')),
  file_url TEXT,
  notes TEXT,
  reminder_days_before INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_maintenance_item ON maintenance_records(item_id, item_type);
CREATE INDEX idx_maintenance_date ON maintenance_records(date_performed DESC);
CREATE INDEX idx_maintenance_user ON maintenance_records(user_id);

CREATE INDEX idx_range_firearm ON range_sessions(firearm_id);
CREATE INDEX idx_range_date ON range_sessions(session_date DESC);
CREATE INDEX idx_range_user ON range_sessions(user_id);

CREATE INDEX idx_compliance_item ON compliance_documents(item_id, item_type);
CREATE INDEX idx_compliance_expiration ON compliance_documents(expiration_date);
CREATE INDEX idx_compliance_user ON compliance_documents(user_id);

-- Enable RLS
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE range_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own maintenance records"
  ON maintenance_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own maintenance records"
  ON maintenance_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own maintenance records"
  ON maintenance_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own maintenance records"
  ON maintenance_records FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own range sessions"
  ON range_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own range sessions"
  ON range_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own range sessions"
  ON range_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own range sessions"
  ON range_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own compliance documents"
  ON compliance_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own compliance documents"
  ON compliance_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own compliance documents"
  ON compliance_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own compliance documents"
  ON compliance_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE range_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE compliance_documents;
