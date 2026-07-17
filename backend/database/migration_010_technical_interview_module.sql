DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'applications'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE applications DROP CONSTRAINT %I', rec.conname);
    RAISE NOTICE 'Dropped legacy status check constraint % on applications', rec.conname;
  END LOOP;
END $$;

ALTER TABLE applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN (
    'Applied',
    'Under Review',
    'Shortlisted',
    'Rejected',
    'Interview Scheduled',
    'Withdrawn',
    'AI Interview Available',
    'AI Interview In Progress',
    'AI Interview Passed',
    'AI Interview Failed',
    'Technical Interview',
    'Technical Interview Scheduled',
    'Technical Interview Completed',
    'Selected'
  ));

CREATE TABLE IF NOT EXISTS technical_interviews (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  ai_interview_id INTEGER REFERENCES ai_interviews(id) ON DELETE SET NULL,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_code VARCHAR(64) NOT NULL UNIQUE,
  scheduled_date DATE NOT NULL,
  scheduled_time VARCHAR(10) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'Scheduled'
    CHECK (status IN ('Scheduled', 'In Progress', 'Awaiting Result', 'Completed', 'Cancelled')),
  candidate_joined_at TIMESTAMP,
  recruiter_joined_at TIMESTAMP,
  meeting_started_at TIMESTAMP,
  meeting_ended_at TIMESTAMP,
  result VARCHAR(10) CHECK (result IN ('Selected', 'Rejected')),
  recruiter_feedback TEXT,
  result_updated_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_technical_interviews_candidate_id ON technical_interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_technical_interviews_recruiter_id ON technical_interviews(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_technical_interviews_job_id ON technical_interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_technical_interviews_status ON technical_interviews(status);
CREATE INDEX IF NOT EXISTS idx_technical_interviews_room_code ON technical_interviews(room_code);

DROP TRIGGER IF EXISTS trg_technical_interviews_updated_at ON technical_interviews;
CREATE TRIGGER trg_technical_interviews_updated_at
BEFORE UPDATE ON technical_interviews
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
