ALTER TABLE job_seeker_profiles ADD COLUMN IF NOT EXISTS resume_text TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS ats_score INTEGER;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS ats_matched_skills TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS ats_missing_skills TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS ats_evaluated_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_applications_ats_score ON applications(ats_score);
