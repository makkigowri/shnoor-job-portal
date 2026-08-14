ALTER TABLE notifications
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING (created_at AT TIME ZONE 'UTC'),
  ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE admin_notifications
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING (created_at AT TIME ZONE 'UTC'),
  ALTER COLUMN created_at SET DEFAULT NOW();
