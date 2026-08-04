- wherever possible.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS resume_id INTEGER REFERENCES user_resumes(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_applications_resume_id ON applications(resume_id);
UPDATE applications ap
SET resume_id = ur.id
FROM user_resumes ur
WHERE ap.resume_id IS NULL
  AND ur.user_id = ap.user_id
  AND ur.resume_path = ap.resume_path;
