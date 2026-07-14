const pool = require("../config/db");
const findAdminByEmail = async (email) => {
  const query = "SELECT * FROM admins WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};
const findAdminById = async (id) => {
  const query = "SELECT id, fullname, email, created_at, updated_at FROM admins WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
const findAdminByIdWithPassword = async (id) => {
  const query = "SELECT * FROM admins WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
const updateAdminPassword = async (id, hashedPassword) => {
  const query = `
    UPDATE admins SET password = $1 WHERE id = $2
    RETURNING id, fullname, email`;
  const result = await pool.query(query, [hashedPassword, id]);
  return result.rows[0];
};
module.exports = { findAdminByEmail, findAdminById, findAdminByIdWithPassword, updateAdminPassword };
