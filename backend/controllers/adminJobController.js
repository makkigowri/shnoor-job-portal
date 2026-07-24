const {
  listJobsAdmin,getJobByIdAdmin,setJobStatusAdmin,deleteJobAdminById,getAllJobsAdminExport} = require("../models/adminStatsModel");
const { buildExportFilename, formatDate, sendExcelFile } = require("../utils/exportUtils");
const listJobs = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const result = await listJobsAdmin({ search, status, page: Number(page), limit: Number(limit) });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
const viewJob = async (req, res, next) => {
  try {
    const job = await getJobByIdAdmin(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};
const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["Active", "Closed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be Active or Closed" });
    }
    const job = await setJobStatusAdmin(req.params.id, status);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.status(200).json({ success: true, message: `Job marked as ${status}`, job });
  } catch (error) {
    next(error);
  }
};
const deleteJob = async (req, res, next) => {
  try {
    const deleted = await deleteJobAdminById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    next(error);
  }
};
const exportJobsAdminHandler = async (req, res, next) => {
  try {
    const jobs = await getAllJobsAdminExport();
    const columns = [
      "Job Title","Department","Employment Type","Experience","Location","Status","Total Applications","Created Date","Recruiter Name"
    ];
    const rows = jobs.map((j) => [
      j.title,j.department || "",j.employment_type || "",j.experience || "",j.location || "",j.status,j.applications_count || 0,formatDate(j.created_at),j.recruiter_name || ""
    ]);
    const filename = buildExportFilename("Jobs_Report");
    await sendExcelFile(res, filename, columns, rows);
  } catch (error) {
    next(error);
  }
};
module.exports = { listJobs, viewJob, updateJobStatus, deleteJob, exportJobsAdminHandler };
