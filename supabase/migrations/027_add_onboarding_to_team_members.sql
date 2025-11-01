-- Add onboarding tracking to team_members table
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{"steps": [], "currentStep": 0}'::jsonb,
ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Add index for querying incomplete onboarding
CREATE INDEX IF NOT EXISTS idx_team_members_onboarding 
ON team_members(user_id, onboarding_completed) 
WHERE onboarding_completed = FALSE;

-- Add comment
COMMENT ON COLUMN team_members.onboarding_completed IS 'Whether the team member has completed the onboarding flow';
COMMENT ON COLUMN team_members.onboarding_progress IS 'JSON object tracking onboarding step progress';
