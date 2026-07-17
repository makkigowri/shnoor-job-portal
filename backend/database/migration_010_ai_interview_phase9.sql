ALTER TABLE ai_interviews
  ALTER COLUMN total_questions SET DEFAULT 5;
ALTER TABLE ai_interviews
  ADD COLUMN IF NOT EXISTS pronunciation_score NUMERIC(5,2);
ALTER TABLE ai_interviews
  ADD COLUMN IF NOT EXISTS total_marks INTEGER NOT NULL DEFAULT 100;
ALTER TABLE ai_interviews
  ADD COLUMN IF NOT EXISTS tab_violations INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_interviews
  ADD COLUMN IF NOT EXISTS fullscreen_violations INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_interviews
  ADD COLUMN IF NOT EXISTS auto_submitted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE ai_interviews
  ADD COLUMN IF NOT EXISTS termination_reason VARCHAR(50);
ALTER TABLE ai_interview_questions
  ADD COLUMN IF NOT EXISTS technical_score NUMERIC(5,2);
ALTER TABLE ai_interview_questions
  ADD COLUMN IF NOT EXISTS communication_score NUMERIC(5,2);
ALTER TABLE ai_interview_questions
  ADD COLUMN IF NOT EXISTS pronunciation_score NUMERIC(5,2);
ALTER TABLE ai_interview_questions
  ADD COLUMN IF NOT EXISTS question_score NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE ai_interview_questions
  ADD COLUMN IF NOT EXISTS max_score NUMERIC(5,2) NOT NULL DEFAULT 20;
ALTER TABLE ai_interview_questions
  ADD COLUMN IF NOT EXISTS question_feedback TEXT;
UPDATE ai_interviews SET total_questions = 5 WHERE status = 'Available';
