-- Adds support for multiple resumes per job seeker (User Profile module enhancement).
-- The existing single-resume columns on job_seeker_profiles are kept and are
-- kept in sync with whichever resume is marked as default, so existing
-- features that read those columns (job applications, ATS scoring, dashboard
-- "hasResume" check, legacy /user/resume page) continue to work unchanged.

CREATE TABLE IF NOT EXISTS user_resumes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_name VARCHAR(255) NOT NULL,
  resume_path VARCHAR(500) NOT NULL,
  resume_filename VARCHAR(255) NOT NULL,
  resume_text TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_default ON user_resumes(user_id, is_default);
DROP TRIGGER IF EXISTS trg_user_resumes_updated_at ON user_resumes;
CREATE TRIGGER trg_user_resumes_updated_at
BEFORE UPDATE ON user_resumes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Backfill: bring any existing single resume already on a profile into the
-- new table as that user's default resume, so no one loses their resume.
INSERT INTO user_resumes (user_id, resume_name, resume_path, resume_filename, resume_text, is_default, uploaded_at)
SELECT jsp.user_id, jsp.resume_filename, jsp.resume_path, jsp.resume_filename, jsp.resume_text, TRUE, COALESCE(jsp.resume_uploaded_at, NOW())
FROM job_seeker_profiles jsp
WHERE jsp.resume_path IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_resumes ur WHERE ur.user_id = jsp.user_id
  );
