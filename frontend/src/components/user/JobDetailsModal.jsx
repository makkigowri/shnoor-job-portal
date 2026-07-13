const JobDetailsModal = ({ job, onClose, onApply, onSave, applying, isSaved, applicationStatus }) => {
  if (!job) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl ring-1 ring-blue-100 max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-8 overflow-y-auto max-h-[90vh]">
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-2xl font-bold text-heading">
                {job.title}
              </h2>
              <p className="text-body mt-2">
                {job.company_name || "SHNOOR Technologies"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-body hover:text-heading text-2xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-sm text-body">Location</p>
              <h4 className="font-semibold">{job.location || "-"}</h4>
            </div>
            <div>
              <p className="text-sm text-body">Experience</p>
              <h4 className="font-semibold">{job.experience || "-"}</h4>
            </div>
            <div>
              <p className="text-sm text-body">Salary</p>
              <h4 className="font-semibold">{job.salary || "-"}</h4>
            </div>
            <div>
              <p className="text-sm text-body">Employment</p>
              <h4 className="font-semibold">{job.employment_type || "-"}</h4>
            </div>
          </div>
          {job.skills && (
            <div className="mt-6 border border-slate-200 rounded-xl p-5 bg-slate-50">
              <p className="text-sm text-body">Skills</p>
              <h4 className="font-semibold mt-1">{job.skills}</h4>
            </div>
          )}
          {job.description && (
            <div className="mt-6 border border-slate-200 rounded-xl p-5 bg-slate-50">
              <h3 className="font-semibold text-lg">Job Description</h3>
              <p className="text-body mt-2 whitespace-pre-line">{job.description}</p>
            </div>
          )}
          {job.responsibilities && (
            <div className="mt-6 border border-slate-200 rounded-xl p-5 bg-slate-50">
              <h3 className="font-semibold text-lg">Responsibilities</h3>
              <p className="text-body mt-2 whitespace-pre-line">{job.responsibilities}</p>
            </div>
          )}
          {job.requirements && (
            <div className="mt-6 border border-slate-200 rounded-xl p-5 bg-slate-50">
              <h3 className="font-semibold text-lg">Requirements</h3>
              <p className="text-body mt-2 whitespace-pre-line">{job.requirements}</p>
            </div>
          )}
          {job.company_description && (
           <div className="mt-6 border border-slate-200 rounded-xl p-5 bg-slate-50">
              <h3 className="font-semibold text-lg">About {job.company_name}</h3>
              <p className="text-body mt-2 whitespace-pre-line">{job.company_description}</p>
            </div>
          )}
          <div className="mt-8 flex gap-4">
            {applicationStatus && applicationStatus !== "Withdrawn" ? (
              <button
                type="button"
                disabled
                className="bg-green-100 text-green-700 px-6 py-3 rounded-lg cursor-default"
              >
                Applied &middot; {applicationStatus}
              </button>
            ) : (
              <button
                type="button"
                onClick={onApply}
                disabled={applying}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover disabled:opacity-50"
              >
                {applying ? "Applying..." : "Apply Now"}
              </button>
            )}
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                className="border border-primary px-6 py-3 rounded-lg text-primary hover:bg-primary hover:text-white transition"
              >
                {isSaved ? "Saved" : "Save"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="border border-border px-6 py-3 rounded-lg hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default JobDetailsModal;