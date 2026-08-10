import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { changeSettingsPassword } from "../../services/adminSettingsService";
import { deleteAdminAccount } from "../../services/adminAuthService";
import useAdminAuth from "../../hooks/useAdminAuth";
import useAdminTheme from "../../hooks/useAdminTheme";
const AdminSettings = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const { darkMode, toggleDarkMode } = useAdminTheme();
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setChangingPassword(true);
    try {
      await changeSettingsPassword(passwordForm);
      setMessage("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to change password.");
    } finally {
      setChangingPassword(false);
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
      await deleteAdminAccount(deletePassword);
      logout();
      navigate("/login");
    } catch (err) {
      setDeleteError(err?.response?.data?.message || "Unable to delete your account right now");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout title="Settings" subtitle="Configure your admin account.">
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`h-11 w-11 inline-flex items-center justify-center rounded-xl border transition ${
            darkMode
              ? "border-gray-600 bg-gray-800 text-yellow-300 hover:bg-gray-700"
              : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
      )}

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-[#3E3A74] mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-2.5 rounded-xl bg-[#3E3A74] text-white font-medium hover:bg-[#2f2c5a] disabled:opacity-60"
            >
              {changingPassword ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
          <h3 className="font-bold text-red-700 mb-1">Delete Account</h3>
          <p className="text-gray-600 text-sm">
            Permanently delete your SHNOOR admin account. This action cannot be undone.
          </p>
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
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  {deleteError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full md:w-2/3 rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
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
    </AdminLayout>
  );
};
export default AdminSettings;
