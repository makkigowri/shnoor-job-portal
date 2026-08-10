const pool = require("../config/db");
const createContactRequest = async (mobileNumber) => {
  const query = `INSERT INTO contact_requests (mobile_number) VALUES ($1) RETURNING *`;
  const result = await pool.query(query, [mobileNumber]);
  return result.rows[0];
};
const getContactRequests = async (limit = 50) => {
  const query = `SELECT * FROM contact_requests ORDER BY submitted_at DESC LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows;
};
module.exports = { createContactRequest, getContactRequests };
