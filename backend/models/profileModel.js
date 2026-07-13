const pool = require("../config/db");
const getProfileByUserId = async (userId) => {
  const query = `SELECT * FROM job_seeker_profiles WHERE user_id = $1`;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};
const upsertProfile = async (userId, profile) => {
  const {
    location,qualification,specialization,skills,github,linkedin,portfolio,about} = profile;
  const query = `
    INSERT INTO job_seeker_profiles
      (user_id, location, qualification, specialization, skills, github, linkedin, portfolio, about)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (user_id) DO UPDATE SET
      location = EXCLUDED.location,qualification = EXCLUDED.qualification,specialization = EXCLUDED.specialization,skills = EXCLUDED.skills,github = EXCLUDED.github,
      linkedin = EXCLUDED.linkedin,portfolio = EXCLUDED.portfolio,about = EXCLUDED.about
    RETURNING *
  `;
  const values = [
    userId,
    location || null, qualification || null,specialization || null,skills || null,github || null,linkedin || null,portfolio || null,about || null
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};
const updateProfilePhoto = async (userId, photoPath) => {
  const query = `
    INSERT INTO job_seeker_profiles (user_id, photo_path) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET photo_path = EXCLUDED.photo_path
    RETURNING * `;
  const result = await pool.query(query, [userId, photoPath]);
  return result.rows[0];
};
module.exports = {getProfileByUserId,upsertProfile,updateProfilePhoto};
