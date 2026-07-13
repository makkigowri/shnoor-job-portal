const pool = require("../config/db");
const getCompanyByRecruiterId = async (recruiterId) => {
  const query = `SELECT * FROM companies WHERE recruiter_id = $1`;
  const result = await pool.query(query, [recruiterId]);
  return result.rows[0];
};
const upsertCompany = async (recruiterId, company) => {
  const {companyName,website,email,phone,industry,companySize,headquarters,description} = company;

  const query = `
    INSERT INTO companies
      (recruiter_id, company_name, website, email, phone, industry, company_size, headquarters, description)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (recruiter_id) DO UPDATE SET
      company_name = EXCLUDED.company_name, website = EXCLUDED.website,email = EXCLUDED.email,phone = EXCLUDED.phone,industry = EXCLUDED.industry,company_size = EXCLUDED.company_size,headquarters = EXCLUDED.headquarters,description = EXCLUDED.description RETURNING * `;
  const values = [
    recruiterId,
    companyName,website || null,email || null,phone || null,industry || null,companySize || null,headquarters || null,description || null
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};
const updateCompanyLogo = async (recruiterId, logoPath, fallbackName) => {
  const query = `
    INSERT INTO companies (recruiter_id, company_name, logo_path) VALUES ($1, $2, $3) ON CONFLICT (recruiter_id) DO UPDATE SET logo_path = EXCLUDED.logo_path RETURNING * `;
  const result = await pool.query(query, [recruiterId, fallbackName || "My Company", logoPath]);
  return result.rows[0];
};
const getCompanyById = async (companyId) => {
  const query = `SELECT * FROM companies WHERE id = $1`;
  const result = await pool.query(query, [companyId]);
  return result.rows[0];
};
module.exports = {getCompanyByRecruiterId,upsertCompany,updateCompanyLogo,getCompanyById};
