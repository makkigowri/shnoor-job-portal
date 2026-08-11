-- Persistent storage for the actual resume file bytes.
-- Keyed by the same filename that is already stored in resume_path
-- (job_seeker_profiles.resume_path, user_resumes.resume_path,
-- applications.resume_path all store "/uploads/<filename>").
-- Storing the bytes in Postgres means a resume survives Render's
-- ephemeral filesystem being wiped on every sleep/restart/redeploy,
-- with no new external service or credentials required.
CREATE TABLE IF NOT EXISTS resume_files (
  filename VARCHAR(255) PRIMARY KEY,
  mimetype VARCHAR(255),
  file_data BYTEA NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);
