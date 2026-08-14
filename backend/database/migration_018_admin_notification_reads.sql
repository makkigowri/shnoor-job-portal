CREATE TABLE IF NOT EXISTS admin_notification_reads (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  activity_key VARCHAR(150) NOT NULL,
  read_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (admin_id, activity_key)
);
CREATE INDEX IF NOT EXISTS idx_admin_notification_reads_admin_id ON admin_notification_reads(admin_id);
