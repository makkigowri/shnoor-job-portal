CREATE TABLE IF NOT EXISTS contact_requests (
  id SERIAL PRIMARY KEY,
  mobile_number VARCHAR(20) NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_read BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_contact_requests_submitted_at ON contact_requests(submitted_at DESC);
