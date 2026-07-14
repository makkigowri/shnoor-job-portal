const {
  listApplicationsAdmin,
  getApplicationByIdAdmin,
  deleteApplicationAdminById
} = require("../models/adminStatsModel");
const listApplications = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const result = await listApplicationsAdmin({ search, status, page: Number(page), limit: Number(limit) });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
const viewApplication = async (req, res, next) => {
  try {
    const application = await getApplicationByIdAdmin(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    res.status(200).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};
const deleteApplication = async (req, res, next) => {
  try {
    const deleted = await deleteApplicationAdminById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    res.status(200).json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    next(error);
  }
};
module.exports = { listApplications, viewApplication, deleteApplication };
