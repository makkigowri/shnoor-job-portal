const {
  listApplicationsAdmin,getApplicationByIdAdmin,deleteApplicationAdminById,getJobByIdAdmin
} = require("../models/adminStatsModel");
const { getApplicantsForExport } = require("../models/applicationModel");
const { buildExportFilename, formatDate, sendExcelFile } = require("../utils/exportUtils");
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
const exportApplicantsAdminHandler = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await getJobByIdAdmin(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    const applicants = await getApplicantsForExport(jobId);
    const columns = [
      "Applicant Name","Email","Phone Number","Resume","Application Status","Assessment Status","AI Interview Status","Technical Interview Status","Applied Date"
    ];
    const rows = applicants.map((a) => [
      a.applicant_name,a.applicant_email,a.applicant_phone || "",a.resume_filename || "",a.application_status,a.assessment_status,a.ai_interview_status,a.technical_interview_status,formatDate(a.applied_at)
    ]);
    const filename = buildExportFilename("Applicants", job.title);
    await sendExcelFile(res, filename, columns, rows);
  } catch (error) {
    next(error);
  }
};
module.exports = { listApplications, viewApplication, deleteApplication, exportApplicantsAdminHandler };
