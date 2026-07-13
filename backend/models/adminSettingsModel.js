const pool = require("../config/db");

const getSettings = async () => {
  const result = await pool.query("SELECT * FROM admin_settings ORDER BY id ASC LIMIT 1");
  return result.rows[0];
};

const updateSettings = async ({ applicationName, supportEmail, theme }) => {
  const existing = await getSettings();
  if (!existing) {
    const insertResult = await pool.query(
      `INSERT INTO admin_settings (application_name, support_email, theme) VALUES ($1, $2, $3) RETURNING *`,
      [applicationName || "Shnoor Job Portal", supportEmail || null, theme || "light"]
    );
    return insertResult.rows[0];
  }
  const query = `
    UPDATE admin_settings SET
      application_name = COALESCE($1, application_name),
      support_email = COALESCE($2, support_email),
      theme = COALESCE($3, theme)
    WHERE id = $4
    RETURNING *`;
  const result = await pool.query(query, [applicationName || null, supportEmail || null, theme || null, existing.id]);
  return result.rows[0];
};

const updateSettingsLogo = async (logoPath) => {
  const existing = await getSettings();
  if (!existing) {
    const insertResult = await pool.query(
      `INSERT INTO admin_settings (application_name, logo_path) VALUES ('Shnoor Job Portal', $1) RETURNING *`,
      [logoPath]
    );
    return insertResult.rows[0];
  }
  const result = await pool.query(
    `UPDATE admin_settings SET logo_path = $1 WHERE id = $2 RETURNING *`,
    [logoPath, existing.id]
  );
  return result.rows[0];
};

module.exports = { getSettings, updateSettings, updateSettingsLogo };
