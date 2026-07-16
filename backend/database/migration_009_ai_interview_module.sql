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
    'Selected'
  ));
CREATE TABLE IF NOT EXISTS ai_interviews (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_submission_id INTEGER REFERENCES assessment_submissions(id) ON DELETE SET NULL,
  job_role VARCHAR(200),
  candidate_skills TEXT,
  candidate_experience VARCHAR(150),
  assessment_percentage NUMERIC(5,2),
  total_questions INTEGER NOT NULL DEFAULT 6,
  questions_asked INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'Available'
    CHECK (status IN ('Available', 'In Progress', 'Completed')),
  technical_score NUMERIC(5,2),
  communication_score NUMERIC(5,2),
  confidence_score NUMERIC(5,2),
  problem_solving_score NUMERIC(5,2),
  overall_score NUMERIC(5,2),
  result VARCHAR(10) CHECK (result IN ('Pass', 'Fail')),
  decision VARCHAR(30) CHECK (decision IN ('Selected', 'Technical Interview', 'Rejected')),
  ai_feedback TEXT,
  strengths TEXT,
  weaknesses TEXT,
  suggestions TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_interviews_candidate_id ON ai_interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_ai_interviews_recruiter_id ON ai_interviews(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_ai_interviews_job_id ON ai_interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_ai_interviews_status ON ai_interviews(status);
DROP TRIGGER IF EXISTS trg_ai_interviews_updated_at ON ai_interviews;
CREATE TRIGGER trg_ai_interviews_updated_at
BEFORE UPDATE ON ai_interviews
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
CREATE TABLE IF NOT EXISTS ai_interview_questions (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER NOT NULL REFERENCES ai_interviews(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  candidate_answer TEXT,
  answer_notes TEXT,
  asked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  answered_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (interview_id, question_order)
);
CREATE INDEX IF NOT EXISTS idx_ai_interview_questions_interview_id ON ai_interview_questions(interview_id);
