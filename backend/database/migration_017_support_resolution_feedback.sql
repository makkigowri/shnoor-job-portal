ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS resolution_feedback VARCHAR(20),
  ADD COLUMN IF NOT EXISTS resolution_feedback_at TIMESTAMP;
