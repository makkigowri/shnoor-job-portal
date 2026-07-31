import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import Pagination from "../../components/admin/Pagination";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import AdminFilterBar from "../../components/admin/AdminFilterBar";
import ActionMenu from "../../components/admin/ActionMenu";
import {
  fetchAdminAssessments,
  fetchAdminAssessmentById,
  deleteAdminAssessment
} from "../../services/adminAssessmentService";
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");
const AdminAssessmentManagement = () => {
  const [data, setData] = useState({ assessments: [], page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewAssessment, setViewAssessment] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const load = async (page = 1) => {
    setLoading(true);
    try {
      const result = await fetchAdminAssessments({ search, status, page, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assessments.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(1);
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load(1);
  };
  const handleView = async (id) => {
    setViewLoading(true);
    try {
      const result = await fetchAdminAssessmentById(id);
      setViewAssessment(result.assessment);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assessment details.");
    } finally {
      setViewLoading(false);
    }
  };
  const runConfirmed = async () => {
    if (!confirmAction) return;
    try {
      await deleteAdminAssessment(confirmAction.id);
      await load(data.page);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setConfirmAction(null);
    }
  };
  return (
  <AdminLayout
    title="Assessment Management"
    subtitle="Oversee every assessment created across the platform."
  >

    <div className="space-y-8">

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-gray-200 bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB] p-8 shadow-sm">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h2 className="text-3xl font-bold text-[#3E3A74]">
              Assessment Dashboard
            </h2>

            <p className="mt-2 text-gray-500">
              Manage assessments, review recruiter activity and monitor submissions.
            </p>

          </div>

          <div className="flex gap-3">

            <Link
              to="/admin/assessments/analytics"
              className="rounded-2xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              Analytics
            </Link>

            <Link
              to="/admin/assessments/reports"
              className="rounded-2xl bg-[#7393D3] px-6 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#5E84D6] hover:shadow-lg"
            >
              Reports
            </Link>

          </div>

        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

          <p className="text-sm font-medium text-gray-500">
            Total Assessments
          </p>

          <h3 className="mt-3 text-4xl font-bold text-[#3E3A74]">
            {data.assessments.length}
          </h3>

          <p className="mt-3 text-sm text-gray-400">
            Available assessments
          </p>

        </div>

        <div className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

          <p className="text-sm font-medium text-gray-500">
            Published
          </p>

          <h3 className="mt-3 text-4xl font-bold text-[#3E3A74]">
            {data.assessments.filter(a => a.status === "Published").length}
          </h3>

          <p className="mt-3 text-sm text-gray-400">
            Live assessments
          </p>

        </div>

        <div className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

          <p className="text-sm font-medium text-gray-500">
            Draft
          </p>

          <h3 className="mt-3 text-4xl font-bold text-[#3E3A74]">
            {data.assessments.filter(a => a.status === "Draft").length}
          </h3>

          <p className="mt-3 text-sm text-gray-400">
            Pending publication
          </p>

        </div>

        <div className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

          <p className="text-sm font-medium text-gray-500">
            Closed
          </p>

          <h3 className="mt-3 text-4xl font-bold text-[#3E3A74]">
            {data.assessments.filter(a => a.status === "Closed").length}
          </h3>

          <p className="mt-3 text-sm text-gray-400">
            Completed assessments
          </p>

        </div>

      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
          searchPlaceholder="Search by assessment title or recruiter..."
          filters={[
            {
              name: "status",
              value: status,
              onChange: setStatus,
              options: [
                { value: "", label: "All Status" },
                { value: "Draft", label: "Draft" },
                { value: "Published", label: "Published" },
                { value: "Closed", label: "Closed" }
              ]
            }
          ]}
        />

      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm">

        <table className="min-w-full text-sm">

          <thead className="bg-[#EEF1FB]">
            <tr className="text-left text-[#3E3A74]">

              <th className="px-6 py-4 font-semibold">Title</th>
              <th className="px-6 py-4 font-semibold">Recruiter</th>
              <th className="px-6 py-4 font-semibold">Questions</th>
              <th className="px-6 py-4 font-semibold">Assigned</th>
              <th className="px-6 py-4 font-semibold">Submitted</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Created</th>
              <th className="px-6 py-4 font-semibold text-center">Actions</th>

            </tr>

          </thead>

          <tbody>
            {loading && (
  <tr>
    <td
      colSpan={8}
      className="px-6 py-20 text-center"
    >
      <div className="flex flex-col items-center">

        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#EEF1FB] border-t-[#7393D3]" />

        <p className="mt-5 font-medium text-gray-500">
          Loading assessments...
        </p>

      </div>
    </td>
  </tr>
)}

{!loading && data.assessments.length === 0 && (
  <tr>
    <td
      colSpan={8}
      className="px-6 py-20 text-center"
    >
      <div className="flex flex-col items-center">

        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF1FB]">

          <svg
            className="h-8 w-8 text-[#7393D3]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17v-2a4 4 0 018 0v2M5 21h14M7 7h10M7 11h10M7 3h10"
            />
          </svg>

        </div>

        <h3 className="text-lg font-semibold text-[#3E3A74]">
          No Assessments Found
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          No assessments match your current filters.
        </p>

      </div>
    </td>
  </tr>
)}

{!loading &&
  data.assessments.map((a) => (

    <tr
      key={a.id}
      className="border-t border-gray-100 transition-all duration-300 hover:bg-[#EEF1FB]/40"
    >

      <td className="px-6 py-5">

        <div>

          <p className="font-semibold text-[#3E3A74]">
            {a.title}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Assessment
          </p>

        </div>

      </td>

      <td className="px-6 py-5 text-gray-600">
        {a.recruiter_name}
      </td>

      <td className="px-6 py-5">

        <span className="rounded-full bg-[#EEF1FB] px-3 py-1 text-xs font-semibold text-[#3E3A74]">
          {a.question_count}
        </span>

      </td>

      <td className="px-6 py-5">

        <span className="rounded-full bg-[#EEF1FB] px-3 py-1 text-xs font-semibold text-[#3E3A74]">
          {a.assigned_count}
        </span>

      </td>

      <td className="px-6 py-5">

        <span className="rounded-full bg-[#EEF1FB] px-3 py-1 text-xs font-semibold text-[#3E3A74]">
          {a.submitted_count}
        </span>

      </td>

      <td className="px-6 py-5">
        <StatusBadge status={a.status} />
      </td>

      <td className="px-6 py-5 text-gray-500">
        {formatDate(a.created_at)}
      </td>

      <td className="px-6 py-5 text-center">

        <ActionMenu
          items={[
            {
              key: "view",
              label: "View",
              onClick: () => handleView(a.id)
            },
            {
              key: "delete",
              label: "Delete",
              danger: true,
              onClick: () =>
                setConfirmAction({
                  id: a.id,
                  name: a.title
                })
            }
          ]}
        />

      </td>

    </tr>

  ))}

</tbody>

</table>

</div>

<div className="mt-6">
  <Pagination
    page={data.page}
    totalPages={data.totalPages}
    onChange={load}
  />
</div>

{viewLoading && (
  <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm">
    Loading assessment...
  </div>
)}

{viewAssessment && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB] px-8 py-6">

  <div className="flex items-start justify-between">

    <div>

      <h2 className="text-2xl font-bold text-[#3E3A74]">
        {viewAssessment.title}
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Assessment Details
      </p>

    </div>

    <StatusBadge status={viewAssessment.status} />

  </div>

</div>

<div className="space-y-8 p-8">

  <div className="grid gap-5 md:grid-cols-2">

    <div className="rounded-2xl border border-gray-200 bg-[#EEF1FB] p-5">

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Recruiter
      </p>

      <h3 className="mt-2 font-semibold text-[#3E3A74]">
        {viewAssessment.recruiter_name}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {viewAssessment.recruiter_email}
      </p>

    </div>

    <div className="rounded-2xl border border-gray-200 bg-[#EEF1FB] p-5">

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Linked Job
      </p>

      <h3 className="mt-2 font-semibold text-[#3E3A74]">
        {viewAssessment.job_title || "—"}
      </h3>

    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-5">

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Duration
      </p>

      <h3 className="mt-2 text-xl font-bold text-[#3E3A74]">
        {viewAssessment.duration_minutes} Minutes
      </h3>

    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-5">

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Marks
      </p>

      <h3 className="mt-2 text-xl font-bold text-[#3E3A74]">
        {viewAssessment.total_marks} / {viewAssessment.passing_marks}
      </h3>

    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-5">

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Assigned
      </p>

      <h3 className="mt-2 text-xl font-bold text-[#3E3A74]">
        {viewAssessment.assigned_count}
      </h3>

    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-5">

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Submitted
      </p>

      <h3 className="mt-2 text-xl font-bold text-[#3E3A74]">
        {viewAssessment.submitted_count}
      </h3>

    </div>

  </div>

  {viewAssessment.description && (

    <div className="rounded-3xl border border-gray-200 bg-white p-6">

      <h3 className="text-lg font-semibold text-[#3E3A74]">
        Description
      </h3>

      <p className="mt-4 whitespace-pre-line leading-7 text-gray-600">
        {viewAssessment.description}
      </p>

    </div>

  )}

  <div className="rounded-3xl border border-gray-200 bg-white p-6">

    <div className="mb-6 flex items-center justify-between">

      <h3 className="text-xl font-bold text-[#3E3A74]">
        Questions ({viewAssessment.questions?.length || 0})
      </h3>

    </div>

    <div className="space-y-4">

      {(viewAssessment.questions || []).map((q, i) => (

        <div
          key={q.id}
          className="rounded-2xl border border-gray-200 p-5 transition-all duration-300 hover:border-[#7393D3] hover:bg-[#EEF1FB]/40"
        >

          <div className="flex items-start justify-between gap-6">

            <div>

              <h4 className="font-semibold text-[#3E3A74]">
                {i + 1}. {q.question_text}
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                {q.question_type}
              </p>

            </div>

            <span className="rounded-full bg-[#EEF1FB] px-4 py-2 text-sm font-semibold text-[#3E3A74]">
              {q.marks} Marks
            </span>

          </div>

        </div>

      ))}

      {(!viewAssessment.questions ||
        viewAssessment.questions.length === 0) && (

        <div className="rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-500">
          No questions added yet.
        </div>

      )}

    </div>

  </div>

  <div className="flex justify-end">

    <button
      onClick={() => setViewAssessment(null)}
      className="rounded-2xl bg-[#7393D3] px-8 py-3 font-medium text-white transition-all duration-300 hover:bg-[#5E84D6] hover:shadow-lg"
    >
      Close
    </button>

  </div>

</div>

</div>
</div>

      )}
<ConfirmDialog
  open={Boolean(confirmAction)}
  title="Delete Assessment"
  message={`This will permanently delete "${confirmAction?.name}" along with its questions, assignments and submissions. This cannot be undone.`}
  confirmLabel="Delete"
  danger
  onConfirm={runConfirmed}
  onCancel={() => setConfirmAction(null)}
/>
</div>
</AdminLayout>
);
};
export default AdminAssessmentManagement;
