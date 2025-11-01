-- Migration 036: Create Valuation History Table
-- Tracks historical valuations for inventory items

CREATE TABLE IF NOT EXISTS valuation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL,
  estimated_value NUMERIC(10,2) NOT NULL,
  confidence_level TEXT DEFAULT 'medium',
  valuation_source TEXT DEFAULT 'ai',
  market_data JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE valuation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own valuation_history" ON valuation_history 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own valuation_history" ON valuation_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own valuation_history" ON valuation_history 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own valuation_history" ON valuation_history 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_valuation_history_user_id ON valuation_history(user_id);
CREATE INDEX idx_valuation_history_item_id ON valuation_history(item_id);
CREATE INDEX idx_valuation_history_created_at ON valuation_history(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE valuation_history;

-- Add trigger to update current_value in inventory table
CREATE OR REPLACE FUNCTION update_inventory_current_value()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory 
  SET current_value = NEW.estimated_value,
      updated_at = NOW()
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_value
  AFTER INSERT ON valuation_history
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_current_value();
