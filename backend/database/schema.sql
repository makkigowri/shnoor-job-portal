CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('jobseeker', 'recruiter')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
CREATE TABLE IF NOT EXISTS job_seeker_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  location VARCHAR(150),
  qualification VARCHAR(150),
  specialization VARCHAR(150),
  skills TEXT,
  github VARCHAR(255),
  linkedin VARCHAR(255),
  portfolio VARCHAR(255),
  about TEXT,
  photo_path VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_job_seeker_profiles_user_id ON job_seeker_profiles(user_id);
DROP TRIGGER IF EXISTS trg_job_seeker_profiles_updated_at ON job_seeker_profiles;
CREATE TRIGGER trg_job_seeker_profiles_updated_at
BEFORE UPDATE ON job_seeker_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  recruiter_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(200) NOT NULL,
  website VARCHAR(255),
  email VARCHAR(150),
  phone VARCHAR(20),
  industry VARCHAR(150),
  company_size VARCHAR(50),
  headquarters VARCHAR(200),
  description TEXT,
  logo_path VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_companies_recruiter_id ON companies(recruiter_id);
DROP TRIGGER IF EXISTS trg_companies_updated_at ON companies;
CREATE TRIGGER trg_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  department VARCHAR(150),
  employment_type VARCHAR(50) NOT NULL DEFAULT 'Full Time',
  experience VARCHAR(100),
  salary VARCHAR(100),
  salary_min INTEGER,
  salary_max INTEGER,
  location VARCHAR(150),
  skills TEXT,
  openings INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  responsibilities TEXT,
  requirements TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Closed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
DROP TRIGGER IF EXISTS trg_jobs_updated_at ON jobs;
CREATE TRIGGER trg_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('success', 'info', 'warning', 'error')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  related_job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
ALTER TABLE job_seeker_profiles ADD COLUMN IF NOT EXISTS resume_path VARCHAR(500);
ALTER TABLE job_seeker_profiles ADD COLUMN IF NOT EXISTS resume_filename VARCHAR(255);
ALTER TABLE job_seeker_profiles ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMP;
ALTER TABLE job_seeker_profiles ADD COLUMN IF NOT EXISTS resume_text TEXT;
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  resume_path VARCHAR(500),
  resume_filename VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'Applied'
    CHECK (status IN ('Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Interview Scheduled', 'Withdrawn')),
  recruiter_note TEXT,
  ats_score INTEGER,
  ats_matched_skills TEXT,
  ats_missing_skills TEXT,
  ats_evaluated_at TIMESTAMP,
  applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, job_id)
);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_ats_score ON applications(ats_score);
DROP TRIGGER IF EXISTS trg_applications_updated_at ON applications;
CREATE TRIGGER trg_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
CREATE TABLE IF NOT EXISTS saved_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, job_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
CREATE TABLE IF NOT EXISTS interviews (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  mode VARCHAR(20) NOT NULL DEFAULT 'Online' CHECK (mode IN ('Online', 'Offline')),
  location_or_link VARCHAR(255),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interviews_recruiter_id ON interviews(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_job_id ON interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
DROP TRIGGER IF EXISTS trg_interviews_updated_at ON interviews;
CREATE TRIGGER trg_interviews_updated_at
BEFORE UPDATE ON interviews
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS trg_admins_updated_at ON admins;
CREATE TRIGGER trg_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE IF NOT EXISTS admin_notifications (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('success', 'info', 'warning', 'error')),
  audience VARCHAR(20) NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'jobseeker', 'recruiter')),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  application_name VARCHAR(150) NOT NULL DEFAULT 'Shnoor Job Portal',
  support_email VARCHAR(150),
  logo_path VARCHAR(500),
  theme VARCHAR(20) NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS trg_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER trg_admin_settings_updated_at
BEFORE UPDATE ON admin_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
INSERT INTO admin_settings (application_name, support_email, theme)
SELECT 'Shnoor Job Portal', 'support@shnoor.com', 'light'
WHERE NOT EXISTS (SELECT 1 FROM admin_settings);
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
CREATE INDEX IF NOT EXISTS idx_assessment_answers_submission_id ON assessment_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_question_id ON assessment_answers(question_id);
DROP TRIGGER IF EXISTS trg_assessment_answers_updated_at ON assessment_answers;
CREATE TRIGGER trg_assessment_answers_updated_at
BEFORE UPDATE ON assessment_answers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
