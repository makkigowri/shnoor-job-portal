import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  fetchAdminSettings,
  saveAdminSettings,
  uploadAdminLogo,
  changeSettingsPassword
} from "../../services/adminSettingsService";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

const AdminSettings = () => {
  const [settings, setSettings] = useState({ applicationName: "", supportEmail: "", theme: "light" });
  const [logoPath, setLogoPath] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchAdminSettings();
        if (result.settings) {
          setSettings({
            applicationName: result.settings.application_name || "",
            supportEmail: result.settings.support_email || "",
            theme: result.settings.theme || "light"
          });
          setLogoPath(result.settings.logo_path || "");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load settings.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await saveAdminSettings(settings);
      setMessage("Settings updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("companyLogo", logoFile);
      const result = await uploadAdminLogo(formData);
      setLogoPath(result.settings.logo_path);
      setLogoFile(null);
      setMessage("Logo updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload logo.");
    }
  };

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

  if (loading) {
    return (
      <AdminLayout title="Settings" subtitle="Configure the application.">
        <p className="text-gray-500">Loading settings...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings" subtitle="Configure application-wide preferences and your admin account.">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-[#3E3A74] mb-4">Application Settings</h3>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Application Name</label>
              <input
                type="text"
                name="applicationName"
                value={settings.applicationName}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Theme</label>
              <select
                name="theme"
                value={settings.theme}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#7393D3] text-white font-medium hover:bg-[#5E84D6] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Application Logo</label>
            {logoPath && (
              <img src={`${API_ORIGIN}${logoPath}`} alt="Application Logo" className="w-16 h-16 object-contain rounded-lg border border-gray-200 mb-3" />
            )}
            <div className="flex gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="flex-1 text-sm"
              />
              <button
                onClick={handleLogoUpload}
                disabled={!logoFile}
                className="px-4 py-2 rounded-xl bg-[#3E3A74] text-white font-medium hover:bg-[#2f2c5a] disabled:opacity-50"
              >
                Upload
              </button>
            </div>
          </div>
        </div>

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
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
