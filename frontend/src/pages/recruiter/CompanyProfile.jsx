import { useEffect, useRef, useState } from "react";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { getMyCompany, saveMyCompany, uploadCompanyLogo } from "../../services/companyService";
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");
const DEFAULT_LOGO = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGzhluKdUf0IhxKsPrl1daQEZatX0_mJi8ITsuYsm8eQ&s=10";
export default function CompanyProfile() {
  const fileInputRef = useRef(null);
  const [company, setCompany] = useState({
    companyName: "",
    website: "",
    email: "",
    phone: "",
    industry: "",
    companySize: "200-500 Employees",
    headquarters: "",
    description: ""
  });
  const [logoPath, setLogoPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  useEffect(() => {
    const loadCompany = async () => {
      setLoading(true);
      try {
        const data = await getMyCompany();
        if (data.company) {
          setCompany({
            companyName: data.company.company_name || "",
            website: data.company.website || "",
            email: data.company.email || "",
            phone: data.company.phone || "",
            industry: data.company.industry || "",
            companySize: data.company.company_size || "200-500 Employees",
            headquarters: data.company.headquarters || "",
            description: data.company.description || ""
          });
          setLogoPath(data.company.logo_path || null);
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load company profile right now");
      } finally {
        setLoading(false);
      }
    };
    loadCompany();
  }, []);
  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMessage("");
    try {
      await saveMyCompany(company);
      setSuccessMessage("Company Profile Saved Successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save company profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const handleLogoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await uploadCompanyLogo(file);
      setLogoPath(data.company?.logo_path || null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to upload logo");
    }
  };
  if (loading) {
    return (
      <RecruiterDashboardLayout>
        <p className="text-gray-500">Loading company profile...</p>
      </RecruiterDashboardLayout>
    );
  }
  return (
    <RecruiterDashboardLayout>
      <h1 className="text-4xl font-bold text-[#3E3A74]">Company Profile</h1>
      <p className="mt-2 text-gray-500">Manage your company information visible to job seekers.</p>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
          {successMessage}
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mt-8 p-8">
        <div className="flex items-center gap-6 mb-8">
          <img
            src={logoPath ? `${API_ORIGIN}${logoPath}` : DEFAULT_LOGO}
            alt="Company Logo"
            className="w-24 h-24 rounded-xl border border-gray-200 object-contain bg-white p-2"
          />
          <div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleLogoSelect}
              className="hidden"
            />
            <button onClick={() => fileInputRef.current?.click()} className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-5 py-2 rounded-lg transition">Upload Logo</button>
            <p className="text-sm text-gray-500 mt-2">PNG / JPG up to 2MB</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="companyName" className="font-medium text-gray-900">Company Name</label>
            <input name="companyName" id="companyName" value={company.companyName} onChange={handleChange} className="w-full border border-gray-300 rounded-xl mt-2 p-3 focus:border-[#7393D3] focus:outline-none" />
          </div>
          <div>
            <label className="font-medium text-gray-900" htmlFor="website">Website</label>
            <input name="website" id="website" value={company.website} onChange={handleChange} className="w-full border border-gray-300 rounded-xl mt-2 p-3 focus:border-[#7393D3] focus:outline-none" />
          </div>
          <div>
            <label className="font-medium text-gray-900" htmlFor="email">Email</label>
            <input name="email" id="email" value={company.email} onChange={handleChange} className="w-full border border-gray-300 rounded-xl mt-2 p-3 focus:border-[#7393D3] focus:outline-none" />
          </div>
          <div>
            <label htmlFor="phone" className="font-medium text-gray-900">Phone</label>
            <input name="phone" id="phone" value={company.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-xl mt-2 p-3 focus:border-[#7393D3] focus:outline-none" />
          </div>
          <div>
            <label htmlFor="industry" className="font-medium text-gray-900">Industry</label>
            <input name="industry" id="industry" value={company.industry} onChange={handleChange} className="w-full border border-gray-300 rounded-xl mt-2 p-3 focus:border-[#7393D3] focus:outline-none" />
          </div>
          <div>
            <label htmlFor="companysize" className="font-medium text-gray-900">Company Size</label>
            <select name="companySize" id="companysize" value={company.companySize} onChange={handleChange} className="w-full border border-gray-300 rounded-xl mt-2 p-3 focus:border-[#7393D3] focus:outline-none">
              <option>1-10 Employees</option>
              <option>10-50 Employees</option>
              <option>50-200 Employees</option>
              <option>200-500 Employees</option>
              <option>500+ Employees</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label id="headquarters" className="font-medium text-gray-900">Headquarters</label>
            <input name="headquarters" id="headquarters" value={company.headquarters} onChange={handleChange} className="w-full border border-gray-300 rounded-xl mt-2 p-3 focus:border-[#7393D3] focus:outline-none" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="font-medium text-gray-900">Company Description</label>
            <textarea rows="6" name="description" id="description" value={company.description} onChange={handleChange} className="w-full border border-gray-300 rounded-xl mt-2 p-3 focus:border-[#7393D3] focus:outline-none" />
          </div>
        </div>
        <div className="mt-8">
          <button disabled={saving} onClick={handleSave} className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-8 py-3 rounded-xl transition disabled:opacity-60">
            {saving ? "Saving..." : "Save Company Profile"}
          </button>
        </div>
      </div>
    </RecruiterDashboardLayout>
  );
}
