-- Enable real-time replication for inventory tables
-- This allows the app to receive instant updates when items are added, updated, or deleted

-- Enable real-time for firearms table
ALTER PUBLICATION supabase_realtime ADD TABLE firearms;

-- Enable real-time for optics table
ALTER PUBLICATION supabase_realtime ADD TABLE optics;

-- Enable real-time for bullets/ammunition table
ALTER PUBLICATION supabase_realtime ADD TABLE bullets;

-- Enable real-time for suppressors table
ALTER PUBLICATION supabase_realtime ADD TABLE suppressors;

-- Note: Real-time updates are filtered by user_id in the application code
-- Only changes to items owned by the logged-in user will trigger updates
