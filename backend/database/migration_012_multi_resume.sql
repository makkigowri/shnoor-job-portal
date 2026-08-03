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
INSERT INTO user_resumes (user_id, resume_name, resume_path, resume_filename, resume_text, is_default, uploaded_at)
SELECT jsp.user_id, jsp.resume_filename, jsp.resume_path, jsp.resume_filename, jsp.resume_text, TRUE, COALESCE(jsp.resume_uploaded_at, NOW())
FROM job_seeker_profiles jsp
WHERE jsp.resume_path IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_resumes ur WHERE ur.user_id = jsp.user_id
  );
