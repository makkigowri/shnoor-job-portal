const {
  listRecruitersAdmin,
  getRecruiterByIdAdmin,
  setUserBlockedStatus,
  deleteUserAdminById
} = require("../models/adminStatsModel");
const listRecruiters = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const result = await listRecruitersAdmin({ search, status, page: Number(page), limit: Number(limit) });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
const viewRecruiter = async (req, res, next) => {
  try {
    const recruiter = await getRecruiterByIdAdmin(req.params.id);
    if (!recruiter) {
      return res.status(404).json({ success: false, message: "Recruiter not found" });
    }
    res.status(200).json({ success: true, recruiter });
  } catch (error) {
    next(error);
  }
};
const blockRecruiter = async (req, res, next) => {
  try {
    const recruiter = await setUserBlockedStatus(req.params.id, true);
    if (!recruiter) {
      return res.status(404).json({ success: false, message: "Recruiter not found" });
    }
    res.status(200).json({ success: true, message: "Recruiter blocked successfully", recruiter });
  } catch (error) {
    next(error);
  }
};
const unblockRecruiter = async (req, res, next) => {
  try {
    const recruiter = await setUserBlockedStatus(req.params.id, false);
    if (!recruiter) {
      return res.status(404).json({ success: false, message: "Recruiter not found" });
    }
    res.status(200).json({ success: true, message: "Recruiter unblocked successfully", recruiter });
  } catch (error) {
    next(error);
  }
};
const deleteRecruiter = async (req, res, next) => {
  try {
    const deleted = await deleteUserAdminById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Recruiter not found" });
    }
    res.status(200).json({ success: true, message: "Recruiter deleted successfully" });
  } catch (error) {
    next(error);
  }
};
module.exports = { listRecruiters, viewRecruiter, blockRecruiter, unblockRecruiter, deleteRecruiter };
