import { useMemo, useState } from "react";
import { updateJob } from "../../services/jobService";
import StatusBadge from "./StatusBadge";
import ActionMenu from "./ActionMenu";
const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};
const AssessmentTable = ({ jobs, onRefresh, setSaveError }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ assessmentLink: "" });
  const [savingId, setSavingId] = useState(null);
  const ordered = useMemo(() => [...jobs].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)), [jobs]);
  const startEdit = (job) => {
    setEditingId(job.id);
    setEditForm({ assessmentLink: job.assessment_link || "" });
    setSaveError("");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setSaveError("");
  };
  const saveEdit = async (job) => {
    setSavingId(job.id);
    setSaveError("");
    try {
      await updateJob(job.id, {
        title: job.title,
        department: job.department,
        employmentType: job.employment_type,
        experience: job.experience,
        salary: job.salary,
        location: job.location,
        skills: job.skills,
        openings: job.openings,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        status: job.status,
        atsThreshold: job.ats_threshold,
        assessmentLink: editForm.assessmentLink
      });
      setEditingId(null);
      await onRefresh();
    } catch (err) {
      setSaveError(err?.response?.data?.message || "Unable to save assessment link right now");
    } finally {
      setSavingId(null);
    }
  };
  const deleteAssessment = async (job) => {
    if (!window.confirm("Are you sure you want to delete this assessment link?")) return;
    setSavingId(job.id);
    setSaveError("");
    try {
      await updateJob(job.id, {
        title: job.title,
        department: job.department,
        employmentType: job.employment_type,
        experience: job.experience,
        salary: job.salary,
        location: job.location,
        skills: job.skills,
        openings: job.openings,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        status: job.status,
        atsThreshold: job.ats_threshold,
        assessmentLink: ""
      });
      await onRefresh();
    } catch (err) {
      setSaveError(err?.response?.data?.message || "Unable to delete assessment link right now");
    } finally {
      setSavingId(null);
    }
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-6 py-4">Job Title</th>
            <th className="text-left px-6 py-4">Assessment Link</th>
            <th className="text-left px-6 py-4">Shortlisted Candidates</th>
            <th className="text-left px-6 py-4">Status</th>
            <th className="text-left px-6 py-4">Last Updated</th>
            <th className="text-center px-6 py-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((job) => {
            const isEditing = editingId === job.id;
            const statusLabel = job.assessment_link && job.assessment_link.trim() ? "Published" : "Draft";
            return (
              <tr key={job.id} className="border-t border-gray-200 hover:bg-gray-50 align-top">
                <td className="px-6 py-5 font-semibold text-gray-900">{job.title}</td>
                <td className="px-6 py-5 text-gray-700 max-w-md">
                  {isEditing ? (
                    <input
                      value={editForm.assessmentLink}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, assessmentLink: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-[#7393D3] focus:outline-none"
                      placeholder="https://assessment.company.com/"
                    />
                  ) : (
                    <span className="break-all">{job.assessment_link || "—"}</span>
                  )}
                </td>
                <td className="px-6 py-5 text-gray-700">{job.shortlisted_candidates_count ?? 0}</td>
                <td className="px-6 py-5">
                  <StatusBadge status={statusLabel} />
                </td>
                <td className="px-6 py-5 text-gray-700">{formatDate(job.updated_at || job.created_at)}</td>
                <td className="px-6 py-5">
                  <div className="flex justify-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(job)}
                          disabled={savingId === job.id}
                          className="bg-[#7393D3] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#5E84D6] transition disabled:opacity-60"
                        >
                          {savingId === job.id ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <ActionMenu
                        items={[
                          {
                            key: "edit",
                            label: "Edit Assessment Link",
                            onClick: () => startEdit(job)
                          },
                          {
                            key: "delete",
                            label: "Delete Assessment",
                            danger: true,
                            disabled: savingId === job.id,
                            onClick: () => deleteAssessment(job)
                          }
                        ]}
                      />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default AssessmentTable;