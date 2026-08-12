CREATE TABLE IF NOT EXISTS resume_files (
  filename VARCHAR(255) PRIMARY KEY,
  mimetype VARCHAR(255),
  file_data BYTEA NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);
