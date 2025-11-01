-- Activity Feed Table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'viewed'
  item_type TEXT NOT NULL, -- 'firearm', 'optic', 'bullet', 'suppressor'
  item_id UUID NOT NULL,
  item_name TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Item Comments Table
CREATE TABLE IF NOT EXISTS item_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  comment TEXT NOT NULL,
  parent_id UUID REFERENCES item_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Presence Table
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  current_page TEXT,
  viewing_item_id UUID,
  viewing_item_type TEXT,
  status TEXT DEFAULT 'online' -- 'online', 'away', 'offline'
);

-- Create indexes
CREATE INDEX idx_activity_feed_user ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_created ON activity_feed(created_at DESC);
CREATE INDEX idx_comments_item ON item_comments(item_type, item_id);
CREATE INDEX idx_comments_user ON item_comments(user_id);
CREATE INDEX idx_presence_status ON user_presence(status);

-- Enable RLS
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all activity" ON activity_feed FOR SELECT USING (true);
CREATE POLICY "Users can insert own activity" ON activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all comments" ON item_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON item_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON item_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON item_comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all presence" ON user_presence FOR SELECT USING (true);
CREATE POLICY "Users can update own presence" ON user_presence FOR ALL USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE item_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
