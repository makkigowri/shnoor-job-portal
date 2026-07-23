import { useEffect, useRef, useState } from "react";
import UserDashboardLayout from "../../layouts/UserDashboardLayout";
import useAuth from "../../hooks/useAuth";
import { getMyProfile, saveMyProfile, uploadProfilePhoto } from "../../services/profileService";
import { getMyResume, uploadResume, deleteResume } from "../../services/resumeService";
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");
const Profile = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const [form, setForm] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: "",
    qualification: "",
    specialization: "",
    skills: "",
    github: "",
    linkedin: "",
    portfolio: "",
    about: ""
  });
  const [photoPath, setPhotoPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [existingResume, setExistingResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [resumeSaving, setResumeSaving] = useState(false);
  const [resumeDeleting, setResumeDeleting] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [resumeSuccessMessage, setResumeSuccessMessage] = useState("");
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await getMyProfile();
        setForm((prev) => ({
          ...prev,
          fullname: data.user?.fullname || prev.fullname,
          email: data.user?.email || prev.email,
          phone: data.user?.phone || prev.phone,
          location: data.profile?.location || "",
          qualification: data.profile?.qualification || "",
          specialization: data.profile?.specialization || "",
          skills: data.profile?.skills || "",
          github: data.profile?.github || "",
          linkedin: data.profile?.linkedin || "",
          portfolio: data.profile?.portfolio || "",
          about: data.profile?.about || ""
        }));
        setPhotoPath(data.profile?.photo_path || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load your profile right now");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);
  useEffect(() => {
    const loadResume = async () => {
      setResumeLoading(true);
      try {
        const data = await getMyResume();
        setExistingResume(data.resume || null);
      } catch (err) {
        setResumeError(err?.response?.data?.message || "Unable to load resume");
      } finally {
        setResumeLoading(false);
      }
    };
    loadResume();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");
    try {
      await saveMyProfile({
        location: form.location,
        qualification: form.qualification,
        specialization: form.specialization,
        skills: form.skills,
        github: form.github,
        linkedin: form.linkedin,
        portfolio: form.portfolio,
        about: form.about
      });
      setSuccessMessage("Profile Saved Successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await uploadProfilePhoto(file);
      setPhotoPath(data.profile?.photo_path || null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to upload photo");
    }
  };
  const handleResumeSelect = (e) => {
    if (e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
      setResumeError("");
      setResumeSuccessMessage("");
    }
  };
  const handleUploadResume = async () => {
    if (!resumeFile) {
      setResumeError("Please choose a resume file first");
      return;
    }
    setResumeSaving(true);
    setResumeError("");
    setResumeSuccessMessage("");
    try {
      const data = await uploadResume(resumeFile);
      setExistingResume(data.resume);
      setResumeFile(null);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
      setResumeSuccessMessage("Resume uploaded successfully");
    } catch (err) {
      setResumeError(err?.response?.data?.message || "Unable to upload resume");
    } finally {
      setResumeSaving(false);
    }
  };
  const handleDeleteResume = async () => {
    setResumeDeleting(true);
    setResumeError("");
    setResumeSuccessMessage("");
    try {
      await deleteResume();
      setExistingResume(null);
      setResumeSuccessMessage("Resume deleted successfully");
    } catch (err) {
      setResumeError(err?.response?.data?.message || "Unable to delete resume");
    } finally {
      setResumeDeleting(false);
    }
  };
  const hasResume = Boolean(existingResume && existingResume.resume_path);
  return (
    <UserDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-heading">
            My Profile
          </h1>
          <p className="text-body mt-2">
            Complete your profile to improve your job recommendations.
          </p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3">
            {successMessage}
          </div>
        )}
        {loading ? (
          <p className="text-body">Loading your profile...</p>
        ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-border shadow-sm p-8"
        >
          <div className="flex items-center gap-6 mb-10">
           {photoPath ? (
             <img
               src={`${API_ORIGIN}${photoPath}`}
               alt="Profile"
               className="w-28 h-28 rounded-full border-2 border-border object-cover"
             />
           ) : (
           <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center">
  <span className="text-gray-600 text-sm">
    No Photo
  </span>
</div>
           )}
            <div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-hover"
              >
                Upload Photo
              </button>
              <p className="text-sm text-body mt-2">
                JPG, PNG (Max 2MB)
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullname" className="block mb-2 font-medium">
                Full Name
              </label>
              <input
                className="w-full border border-border rounded-lg px-4 py-3 bg-gray-50"
                name="fullname"
                value={form.fullname}
                readOnly
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 font-medium">
                Email
              </label>
              <input
                className="w-full border border-border rounded-lg px-4 py-3 bg-gray-50"
                name="email"
                value={form.email}
                readOnly
              />
            </div>
            <div>
              <label htmlFor="phone" className="block mb-2 font-medium">
                Phone
              </label>
              <input
                className="w-full border border-border rounded-lg px-4 py-3 bg-gray-50"
                name="phone"
                value={form.phone}
                readOnly
              />
            </div>
            <div>
              <label htmlFor="location" className="block mb-2 font-medium">
                Location
              </label>
              <input
                className="w-full border border-border rounded-lg px-4 py-3"
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="qualification" className="block mb-2 font-medium">
                Qualification
              </label>
              <input
                className="w-full border border-border rounded-lg px-4 py-3"
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="specialization" className="block mb-2 font-medium">
                Specialization
              </label>
              <input
                className="w-full border border-border rounded-lg px-4 py-3"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="skills" className="block mb-2 font-medium">
                Skills
              </label>
              <input
                className="w-full border border-border rounded-lg px-4 py-3"
                name="skills"
                value={form.skills}
                placeholder="React, Java, Python..."
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="github" className="block mb-2 font-medium">
                GitHub
              </label>
              <input
                className="w-full border border-border rounded-lg px-4 py-3"
                name="github"
                value={form.github}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="linkedin" className="block mb-2 font-medium">
                LinkedIn
              </label>
              <input
                className="w-full border border-border rounded-lg px-4 py-3"
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="resume" className="block mb-2 font-medium">
                Upload Resume
              </label>
              {resumeError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 mb-3 text-sm">
                  {resumeError}
                </div>
              )}
              {resumeSuccessMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 mb-3 text-sm">
                  {resumeSuccessMessage}
                </div>
              )}
              {!resumeLoading && hasResume && (
                <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary">
                      Current Resume
                    </p>
                    <p className="text-sm text-body truncate">
                      {existingResume.resume_filename}
                    </p>
                  </div>
                  <a
                    href={`${API_ORIGIN}${existingResume.resume_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 border border-primary text-primary px-3 py-1.5 rounded-lg text-sm hover:bg-primary hover:text-white transition"
                  >
                    View
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3">
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  ref={resumeInputRef}
                  onChange={handleResumeSelect}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-white file:cursor-pointer"
                />
              </div>
              {resumeFile && (
                <p className="text-sm text-body mt-2">
                  Selected: {resumeFile.name}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={handleUploadResume}
                  disabled={resumeSaving || !resumeFile}
                  className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {resumeSaving ? "Uploading..." : hasResume ? "Replace Resume" : "Upload"}
                </button>
                {hasResume && (
                  <button
                    type="button"
                    onClick={handleDeleteResume}
                    disabled={resumeDeleting}
                    className="border border-red-500 text-red-500 px-5 py-2 rounded-lg hover:bg-red-500 hover:text-white transition disabled:opacity-50 text-sm"
                  >
                    {resumeDeleting ? "Removing..." : "Remove Resume"}
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Accepted formats: PDF, DOC, DOCX. Maximum size 5MB.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <label htmlFor="aboutme" className="block mb-2 font-medium">
              About Me
            </label>
            <textarea
              rows={5}
              className="w-full border border-border rounded-lg px-4 py-3"
              name="about"
              value={form.about}
              onChange={handleChange}
            />
          </div>
          <div className="mt-8">
            <button
              disabled={saving}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-hover disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
        )}
      </div>
    </UserDashboardLayout>
  );
};
export default Profile;