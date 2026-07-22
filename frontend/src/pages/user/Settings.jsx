import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDashboardLayout from "../../layouts/UserDashboardLayout";
import { changePassword, deleteAccount } from "../../services/authService";
import useAuth from "../../hooks/useAuth";
const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
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
    <UserDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-heading">
            Account Settings
          </h1>
          <p className="mt-2 text-body">
            Manage your account preferences and security settings.
          </p>
        </div>
        <form onSubmit={handlePasswordChange} className="bg-white rounded-xl border border-border shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">
            Change Password
          </h2>
          {passwordError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3">
              {passwordSuccess}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-3"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-3"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-3"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={passwordSaving}
            className="mt-6 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover disabled:opacity-60"
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
        <div className="bg-white rounded-xl border border-border shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            Danger Zone
          </h2>
          <p className="text-body">
            Permanently delete your SHNOOR Job Portal account. This action cannot be undone.
          </p>
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="mt-6 border border-red-500 text-red-500 px-6 py-3 rounded-lg hover:bg-red-500 hover:text-white transition"
            >
              Delete Account
            </button>
          ) : (
            <div className="mt-6 space-y-4">

              {deleteError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
                  {deleteError}
                </div>
              )}
              <div>
                <label className="block mb-2 font-medium">
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
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => {
                    setConfirmingDelete(false);
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  className="border border-border px-6 py-3 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserDashboardLayout>
  );
};
export default Settings;
