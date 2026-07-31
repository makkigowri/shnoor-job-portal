const pool = require("../config/db");


const createOfferLetter = async ({
  applicationId,
  recruiterId,
  candidateId,
  
  message,
}) => {
  const query = `
INSERT INTO offer_letters
(
application_id,
recruiter_id,
candidate_id,
message,
status,
sent_at
)
VALUES ($1,$2,$3,$4,'Sent',NOW())
RETURNING *;
`;
  const values = [
    applicationId,
    recruiterId,
    candidateId,
    
    message,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};


const getOfferLetterByApplication = async (applicationId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM offer_letters
    WHERE application_id=$1
    `,
    [applicationId]
  );

  return result.rows[0];
};

// Candidate views offer letter
const markOfferViewed = async (id) => {
  const result = await pool.query(
    `
    UPDATE offer_letters
    SET
      viewed_at = NOW(),
      status='Viewed'
    WHERE id=$1
    RETURNING *;
    `,
    [id]
  );

  return result.rows[0];
};
const getOfferEmailDetails = async (applicationId) => {
  const result = await pool.query(
    `
    SELECT
      ap.id AS application_id,
      u.fullname AS candidate_name,
      u.email AS candidate_email,
      j.title AS job_title,
      j.salary AS job_salary
    FROM applications ap
    JOIN users u ON u.id = ap.user_id
    JOIN jobs j ON j.id = ap.job_id
    WHERE ap.id = $1
    `,
    [applicationId]
  );

  return result.rows[0];
};
module.exports = {
  createOfferLetter,
  getOfferLetterByApplication,
  markOfferViewed,
  getOfferEmailDetails,
};