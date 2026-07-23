import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { changePassword, deleteAccount } from "../../services/authService";
import useAuth from "../../hooks/useAuth";
export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Please fill in both password fields");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordSuccess("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err?.response?.data?.message || "Unable to update password right now");
    } finally {
      setPasswordSaving(false);
    }
  };
  const handleDeleteAccount = async () => {
    setDeleteError("");
    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm");
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      logout();
      navigate("/login");
    } catch (err) {
      setDeleteError(err?.response?.data?.message || "Unable to delete your account right now");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <RecruiterDashboardLayout>
      <div>
        <h1 className="text-4xl font-bold text-[#3E3A74]">Recruiter Settings</h1>
        <p className="mt-2 text-gray-500">Manage your recruiter account and security settings.</p>
      </div>
      <div className="space-y-8 mt-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-semibold text-[#3E3A74]">Recruiter Information</h2>
            <Link
              to="/recruiter/company-profile"
              className="text-sm px-4 py-2 rounded-lg border border-[#7393D3] text-[#3E3A74] hover:bg-[#7393D3] hover:text-white transition"
            >
              Edit Company Profile
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label htmlFor="fullname" className="font-medium text-gray-900">Full Name</label>
              <input value={user?.fullname || ""} readOnly id="fullname" className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 mt-2" />
            </div>
            <div>
              <label htmlFor="email" className="font-medium text-gray-900">Email</label>
              <input value={user?.email || ""} readOnly  id="email" className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 mt-2" />
            </div>
            <div>
              <label htmlFor="phone" className="font-medium text-gray-900">Phone</label>
              <input value={user?.phone || ""} readOnly id="phone" className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 mt-2" />
            </div>
            <div>
              <label htmlFor="role" className="font-medium text-gray-900">Role</label>
              <input value="Recruiter" readOnly id="role" className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 mt-2" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Company details (logo, industry, description) are managed on the Company Profile page.</p>
        </div>
        <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-[#3E3A74]">Change Password</h2>
          {passwordError && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">{passwordSuccess}</div>
          )}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="md:col-span-2">
              <label htmlFor="currrentpwd" className="font-medium text-gray-900">Current Password</label>
              <input
                type="password" id="currentpwd"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl p-3 mt-2 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="newpwd" className="font-medium text-gray-900">New Password</label>
              <input
                type="password" id="newpwd"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl p-3 mt-2 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="cnewowd" className="font-medium text-gray-900">Confirm New Password</label>
              <input
                type="password" id="cnewpwd"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl p-3 mt-2 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
          </div>
          <button
            disabled={passwordSaving}
            className="mt-8 bg-[#7393D3] hover:bg-[#5E84D6] text-white px-8 py-3 rounded-xl transition disabled:opacity-60"
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8">
         
          <p className="mt-3 text-gray-600">Permanently delete your SHNOOR recruiter account, including all your job postings. This action cannot be undone.</p>
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="mt-6 border border-red-700 text-red-700 px-6 py-3 rounded-xl hover:bg-red-700 hover:text-white transition"
            >
              Delete Account
            </button>
          ) : (
            <div className="mt-6 space-y-4">
              {deleteError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{deleteError}</div>
              )}
               <div>
                <label htmlFor="cnf" className="block mb-2 font-medium">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full md:w-1/2 border border-border rounded-lg px-4 py-3"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-red-700 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => {
                    setConfirmingDelete(false);
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  className="border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RecruiterDashboardLayout>
  );
}
