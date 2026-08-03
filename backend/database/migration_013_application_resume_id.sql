-- Links each job application to the specific resume (from user_resumes) that
-- the candidate selected at the time of applying. This supports the
-- "Select Resume" step in the Apply Job workflow.
--
-- Backward compatible: resume_id is nullable and existing applications keep
-- working off resume_path/resume_filename exactly as before. For existing
-- rows we backfill resume_id by matching the stored resume_path against the
-- candidate's resumes, so historical applications also show a linked resume
-- wherever possible.

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS resume_id INTEGER REFERENCES user_resumes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_applications_resume_id ON applications(resume_id);

-- Backfill: match each application's stored resume_path to the matching
-- user_resumes row for that same user, when one exists.
UPDATE applications ap
SET resume_id = ur.id
FROM user_resumes ur
WHERE ap.resume_id IS NULL
  AND ur.user_id = ap.user_id
  AND ur.resume_path = ap.resume_path;
