-- Enable real-time subscriptions for category-specific tables
-- This allows the app to receive instant updates when items are added, updated, or deleted

-- Enable real-time for firearms table
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS firearms;

-- Enable real-time for optics table
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS optics;

-- Enable real-time for bullets table
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS bullets;

-- Enable real-time for suppressors table
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS suppressors;
