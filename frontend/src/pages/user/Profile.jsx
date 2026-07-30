import { useEffect, useRef, useState } from "react";
import UserDashboardLayout from "../../layouts/UserDashboardLayout";
import useAuth from "../../hooks/useAuth";
import { getMyProfile, saveMyProfile, uploadProfilePhoto } from "../../services/profileService";
import {
  getMyResumes,
  uploadAdditionalResume,
  deleteAdditionalResume,
} from "../../services/resumeService";
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
  
  const [resumeSaving, setResumeSaving] = useState(false);
  const [resumes, setResumes] = useState([]);
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
  loadResumes();
}, []);

const loadResumes = async () => {
  try {
    const data = await getMyResumes();
    setResumes(data.resumes || []);
  } catch (err) {
    console.error(err);
  }
};

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
    setResumeError("Please choose a resume.");
    return;
  }

  setResumeSaving(true);

  try {
    await uploadAdditionalResume(resumeFile);

    setResumeFile(null);

    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }

    loadResumes();

    setResumeSuccessMessage("Resume uploaded successfully");
  } catch (err) {
    setResumeError(err?.response?.data?.message || "Upload failed");
  } finally {
    setResumeSaving(false);
  }
};
 
  
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
                name="fullname" id="fullname"
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
                name="email" id="email"
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
                name="phone" id="phone"
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
                name="location" id="location"
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
                name="qualification" id="qualification"
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
                name="specialization" id="specialization"
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
                name="skills" id="skills"
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
                name="github" id="github"
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
                name="linkedin" id="linkedin"
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
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleUploadResume}
                  disabled={resumeSaving || !resumeFile}
                  className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50"
                >
                  {resumeSaving ? "Uploading..." : "Upload Resume"}
                </button>
              </div>
              {resumes.length > 0 && (
  <div className="mt-6">
    <h3 className="font-semibold text-lg mb-3">
      My Resumes
    </h3>

    <div className="space-y-3">
      {resumes.map((resume) => (
        <div
          key={resume.id}
          className="flex items-center justify-between border rounded-lg p-3"
        >
          <div>
            <p className="font-medium">
              {resume.resume_filename}
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href={`${API_ORIGIN}${resume.resume_path}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              View
            </a>

            <button
              type="button"
              onClick={async () => {
                await deleteAdditionalResume(resume.id);
                loadResumes();
              }}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
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
              name="about" id="aboutme"
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