ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS announcement_id INTEGER REFERENCES admin_notifications(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_notifications_announcement_id ON notifications(announcement_id);
