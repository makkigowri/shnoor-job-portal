const pool = require("../config/db");
const createUser = async ({ fullname, email, phone, password, role }) => {
  const query = `
    INSERT INTO users (fullname, email, phone, password, role) VALUES ($1, $2, $3, $4, $5)
    RETURNING id, fullname, email, phone, role, created_at `;
  const values = [fullname, email, phone, password, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};
const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};
const findUserById = async (id) => {
  const query = "SELECT id, fullname, email, phone, role, created_at, updated_at FROM users WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
const findUserByIdWithPassword = async (id) => {
  const query = "SELECT * FROM users WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
const updateUserPassword = async (id, hashedPassword) => {
  const query = `
    UPDATE users SET password = $1 WHERE id = $2
    RETURNING id, fullname, email, phone, role
  `;
  const result = await pool.query(query, [hashedPassword, id]);
  return result.rows[0];
};
const deleteUserById = async (id) => {
  const query = "DELETE FROM users WHERE id = $1 RETURNING id";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
module.exports = {createUser,findUserByEmail,findUserById,findUserByIdWithPassword,updateUserPassword,deleteUserById};
