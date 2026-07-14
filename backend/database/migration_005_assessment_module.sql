CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  instructions TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  total_marks INTEGER NOT NULL DEFAULT 0,
  passing_marks INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Closed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS recruiter_id INTEGER;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS job_id INTEGER;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS title VARCHAR(200);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 30;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS total_marks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS passing_marks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Draft';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assessments_recruiter_id_fkey'
  ) THEN
    ALTER TABLE assessments
      ADD CONSTRAINT assessments_recruiter_id_fkey
      FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assessments_job_id_fkey'
  ) THEN
    ALTER TABLE assessments
      ADD CONSTRAINT assessments_job_id_fkey
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;
  END IF;
END $$;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM assessments WHERE recruiter_id IS NULL) THEN
    ALTER TABLE assessments ALTER COLUMN recruiter_id SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_assessments_recruiter_id ON assessments(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_assessments_job_id ON assessments(job_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);

DROP TRIGGER IF EXISTS trg_assessments_updated_at ON assessments;
CREATE TRIGGER trg_assessments_updated_at
BEFORE UPDATE ON assessments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
CREATE TABLE IF NOT EXISTS assessment_questions (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false', 'short_answer')),
  options JSONB,
  correct_answer TEXT,
  marks INTEGER NOT NULL DEFAULT 1 CHECK (marks > 0),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS assessment_id INTEGER;
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS question_text TEXT;
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS question_type VARCHAR(20) NOT NULL DEFAULT 'mcq';
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS options JSONB;
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS correct_answer TEXT;
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS marks INTEGER NOT NULL DEFAULT 1;
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assessment_questions_assessment_id_fkey'
  ) THEN
    ALTER TABLE assessment_questions
      ADD CONSTRAINT assessment_questions_assessment_id_fkey
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM assessment_questions WHERE assessment_id IS NULL) THEN
    ALTER TABLE assessment_questions ALTER COLUMN assessment_id SET NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM assessment_questions WHERE question_text IS NULL) THEN
    ALTER TABLE assessment_questions ALTER COLUMN question_text SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_id ON assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_order ON assessment_questions(assessment_id, order_index);

DROP TRIGGER IF EXISTS trg_assessment_questions_updated_at ON assessment_questions;
CREATE TRIGGER trg_assessment_questions_updated_at
BEFORE UPDATE ON assessment_questions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
CREATE TABLE IF NOT EXISTS assessment_assignments (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
  recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'Started', 'Completed', 'Expired')),
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (assessment_id, candidate_id)
);
ALTER TABLE assessment_assignments ADD COLUMN IF NOT EXISTS assessment_id INTEGER;
ALTER TABLE assessment_assignments ADD COLUMN IF NOT EXISTS candidate_id INTEGER;
ALTER TABLE assessment_assignments ADD COLUMN IF NOT EXISTS application_id INTEGER;
ALTER TABLE assessment_assignments ADD COLUMN IF NOT EXISTS recruiter_id INTEGER;
ALTER TABLE assessment_assignments ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMP;
ALTER TABLE assessment_assignments ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMP;
ALTER TABLE assessment_assignments ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Assigned';
ALTER TABLE assessment_assignments ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE assessment_assignments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_assignments_assessment_id_fkey') THEN
    ALTER TABLE assessment_assignments ADD CONSTRAINT assessment_assignments_assessment_id_fkey
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_assignments_candidate_id_fkey') THEN
    ALTER TABLE assessment_assignments ADD CONSTRAINT assessment_assignments_candidate_id_fkey
      FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_assignments_application_id_fkey') THEN
    ALTER TABLE assessment_assignments ADD CONSTRAINT assessment_assignments_application_id_fkey
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_assignments_recruiter_id_fkey') THEN
    ALTER TABLE assessment_assignments ADD CONSTRAINT assessment_assignments_recruiter_id_fkey
      FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_assignments_assessment_id_candidate_id_key') THEN
    ALTER TABLE assessment_assignments ADD CONSTRAINT assessment_assignments_assessment_id_candidate_id_key
      UNIQUE (assessment_id, candidate_id);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM assessment_assignments WHERE assessment_id IS NULL) THEN
    ALTER TABLE assessment_assignments ALTER COLUMN assessment_id SET NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM assessment_assignments WHERE candidate_id IS NULL) THEN
    ALTER TABLE assessment_assignments ALTER COLUMN candidate_id SET NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM assessment_assignments WHERE recruiter_id IS NULL) THEN
    ALTER TABLE assessment_assignments ALTER COLUMN recruiter_id SET NOT NULL;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_assessment_assignments_assessment_id ON assessment_assignments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_assignments_candidate_id ON assessment_assignments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_assessment_assignments_recruiter_id ON assessment_assignments(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_assessment_assignments_status ON assessment_assignments(status);

DROP TRIGGER IF EXISTS trg_assessment_assignments_updated_at ON assessment_assignments;
CREATE TRIGGER trg_assessment_assignments_updated_at
BEFORE UPDATE ON assessment_assignments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
CREATE TABLE IF NOT EXISTS assessment_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL UNIQUE REFERENCES assessment_assignments(id) ON DELETE CASCADE,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP,
  submitted_at TIMESTAMP,
  time_taken_seconds INTEGER,
  total_score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  result VARCHAR(10) CHECK (result IN ('Pass', 'Fail')),
  status VARCHAR(20) NOT NULL DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Submitted', 'Auto Submitted')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS assignment_id INTEGER;
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS assessment_id INTEGER;
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS candidate_id INTEGER;
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP;
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER;
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS total_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS max_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS percentage NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS result VARCHAR(10);
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'In Progress';
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_submissions_assignment_id_fkey') THEN
    ALTER TABLE assessment_submissions ADD CONSTRAINT assessment_submissions_assignment_id_fkey
      FOREIGN KEY (assignment_id) REFERENCES assessment_assignments(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_submissions_assignment_id_key') THEN
    ALTER TABLE assessment_submissions ADD CONSTRAINT assessment_submissions_assignment_id_key UNIQUE (assignment_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_submissions_assessment_id_fkey') THEN
    ALTER TABLE assessment_submissions ADD CONSTRAINT assessment_submissions_assessment_id_fkey
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_submissions_candidate_id_fkey') THEN
    ALTER TABLE assessment_submissions ADD CONSTRAINT assessment_submissions_candidate_id_fkey
      FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM assessment_submissions WHERE assignment_id IS NULL) THEN
    ALTER TABLE assessment_submissions ALTER COLUMN assignment_id SET NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM assessment_submissions WHERE assessment_id IS NULL) THEN
    ALTER TABLE assessment_submissions ALTER COLUMN assessment_id SET NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM assessment_submissions WHERE candidate_id IS NULL) THEN
    ALTER TABLE assessment_submissions ALTER COLUMN candidate_id SET NOT NULL;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_assessment_id ON assessment_submissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_candidate_id ON assessment_submissions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_status ON assessment_submissions(status);

DROP TRIGGER IF EXISTS trg_assessment_submissions_updated_at ON assessment_submissions;
CREATE TRIGGER trg_assessment_submissions_updated_at
BEFORE UPDATE ON assessment_submissions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
CREATE TABLE IF NOT EXISTS assessment_answers (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES assessment_submissions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  is_correct BOOLEAN,
  marks_obtained INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (submission_id, question_id)
);
ALTER TABLE assessment_answers ADD COLUMN IF NOT EXISTS submission_id INTEGER;
ALTER TABLE assessment_answers ADD COLUMN IF NOT EXISTS question_id INTEGER;
ALTER TABLE assessment_answers ADD COLUMN IF NOT EXISTS answer_text TEXT;
ALTER TABLE assessment_answers ADD COLUMN IF NOT EXISTS is_correct BOOLEAN;
ALTER TABLE assessment_answers ADD COLUMN IF NOT EXISTS marks_obtained INTEGER NOT NULL DEFAULT 0;
ALTER TABLE assessment_answers ADD COLUMN IF NOT EXISTS answered_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE assessment_answers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_answers_submission_id_fkey') THEN
    ALTER TABLE assessment_answers ADD CONSTRAINT assessment_answers_submission_id_fkey
      FOREIGN KEY (submission_id) REFERENCES assessment_submissions(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_answers_question_id_fkey') THEN
    ALTER TABLE assessment_answers ADD CONSTRAINT assessment_answers_question_id_fkey
      FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_answers_submission_id_question_id_key') THEN
    ALTER TABLE assessment_answers ADD CONSTRAINT assessment_answers_submission_id_question_id_key
      UNIQUE (submission_id, question_id);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM assessment_answers WHERE submission_id IS NULL) THEN
    ALTER TABLE assessment_answers ALTER COLUMN submission_id SET NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM assessment_answers WHERE question_id IS NULL) THEN
    ALTER TABLE assessment_answers ALTER COLUMN question_id SET NOT NULL;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_assessment_answers_submission_id ON assessment_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_question_id ON assessment_answers(question_id);

DROP TRIGGER IF EXISTS trg_assessment_answers_updated_at ON assessment_answers;
CREATE TRIGGER trg_assessment_answers_updated_at
BEFORE UPDATE ON assessment_answers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();