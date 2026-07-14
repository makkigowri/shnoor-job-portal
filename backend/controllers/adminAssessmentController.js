const {
  listAssessmentsAdmin,
  getAssessmentByIdAdmin,
  deleteAssessmentAdminById,
  getAssessmentStatisticsAdmin
} = require("../models/adminStatsModel");
const listAssessments = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const result = await listAssessmentsAdmin({ search, status, page: Number(page), limit: Number(limit) });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
const viewAssessment = async (req, res, next) => {
  try {
    const assessment = await getAssessmentByIdAdmin(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }
    res.status(200).json({ success: true, assessment });
  } catch (error) {
    next(error);
  }
};
const deleteAssessment = async (req, res, next) => {
  try {
    const deleted = await deleteAssessmentAdminById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }
    res.status(200).json({ success: true, message: "Assessment deleted successfully" });
  } catch (error) {
    next(error);
  }
};
const getStatistics = async (req, res, next) => {
  try {
    const statistics = await getAssessmentStatisticsAdmin();
    res.status(200).json({ success: true, statistics });
  } catch (error) {
    next(error);
  }
};
module.exports = { listAssessments, viewAssessment, deleteAssessment, getStatistics };
