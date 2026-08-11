const pool = require("../config/db");

// Stores/reads/deletes the actual resume file bytes in Postgres, keyed by
// the same filename already used in resume_path ("/uploads/<filename>").
// This is what makes a resume survive the Render backend instance sleeping,
// restarting, or being redeployed: the bytes live in the database, not on
// the app instance's local (ephemeral) disk.

const saveResumeFile = async (filename, buffer, mimetype) => {
  const query = `
    INSERT INTO resume_files (filename, mimetype, file_data, uploaded_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (filename) DO UPDATE SET
      mimetype = EXCLUDED.mimetype,
      file_data = EXCLUDED.file_data,
      uploaded_at = NOW()
  `;
  await pool.query(query, [filename, mimetype, buffer]);
};

const getResumeFile = async (filename) => {
  const result = await pool.query(
    `SELECT filename, mimetype, file_data FROM resume_files WHERE filename = $1`,
    [filename]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { filename: row.filename, mimetype: row.mimetype, data: row.file_data };
};

const deleteResumeFile = async (filename) => {
  if (!filename) return;
  await pool.query(`DELETE FROM resume_files WHERE filename = $1`, [filename]);
};

module.exports = {
  saveResumeFile,
  getResumeFile,
  deleteResumeFile
};
