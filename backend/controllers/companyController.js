const { getCompanyByRecruiterId, upsertCompany, updateCompanyLogo } = require("../models/companyModel");
const getMyCompany = async (req, res, next) => {
  try {
    const company = await getCompanyByRecruiterId(req.user.id);
    res.status(200).json({
      success: true,
      company: company || null
    });
  } catch (error) {
    next(error);
  }
};
const saveMyCompany = async (req, res, next) => {
  try {
    const company = await upsertCompany(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Company profile saved successfully",
      company
    });
  } catch (error) {
    next(error);
  }
};
const uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No logo file uploaded" });
    }
    const logoPath = `/uploads/${req.file.filename}`;
    const existing = await getCompanyByRecruiterId(req.user.id);
    const company = await updateCompanyLogo(
      req.user.id,
      logoPath,
      existing ? existing.company_name : req.user.fullname
    );
    res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      company
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { getMyCompany, saveMyCompany, uploadCompanyLogo };
