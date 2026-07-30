const pool = require("../config/db");


const createOfferLetter = async ({
  applicationId,
  recruiterId,
  candidateId,
  fileUrl,
  message,
}) => {
  const query = `
    INSERT INTO offer_letters
    (
      application_id,
      recruiter_id,
      candidate_id,
      file_url,
      message,
      status,
      sent_at
    )
    VALUES ($1,$2,$3,$4,$5,'Sent',NOW())
    RETURNING *;
  `;

  const values = [
    applicationId,
    recruiterId,
    candidateId,
    fileUrl,
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

module.exports = {
  createOfferLetter,
  getOfferLetterByApplication,
  markOfferViewed,
};