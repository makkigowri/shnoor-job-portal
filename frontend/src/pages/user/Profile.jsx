import { useEffect, useRef, useState } from "react";
import { FileText, Plus, X } from "lucide-react";
import UserDashboardLayout from "../../layouts/UserDashboardLayout";
import useAuth from "../../hooks/useAuth";
import { getMyProfile, saveMyProfile, uploadProfilePhoto, removeProfilePhoto } from "../../services/profileService";
import {
  getMyResumes,
  addResume,
  replaceResumeById,
  setDefaultResumeById,
  deleteResumeById,
  downloadResumeById
} from "../../services/resumeService";
import ProfileField from "../../components/common/ProfileField";
import ProfileActionButtons from "../../components/common/ProfileActionButtons";
import ActionMenu from "../../components/admin/ActionMenu";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
const formatResumeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");
const Profile = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const addResumeInputRef = useRef(null);
  const replaceResumeInputRef = useRef(null);
  const replaceTargetIdRef = useRef(null);
  const emptyForm = {
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
  };
  const [form, setForm] = useState(emptyForm);
  const [savedForm, setSavedForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [photoPath, setPhotoPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [photoRemoving, setPhotoRemoving] = useState(false);
  const [photoRemoveConfirmOpen, setPhotoRemoveConfirmOpen] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [addingResume, setAddingResume] = useState(false);
  const [busyResumeId, setBusyResumeId] = useState(null);
  const [resumeActionError, setResumeActionError] = useState("");
  const [resumeActionSuccess, setResumeActionSuccess] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await getMyProfile();
        const loaded = {
          fullname: data.user?.fullname || emptyForm.fullname,
          email: data.user?.email || emptyForm.email,
          phone: data.user?.phone || emptyForm.phone,
          location: data.profile?.location || "",
          qualification: data.profile?.qualification || "",
          specialization: data.profile?.specialization || "",
          skills: data.profile?.skills || "",
          github: data.profile?.github || "",
          linkedin: data.profile?.linkedin || "",
          portfolio: data.profile?.portfolio || "",
          about: data.profile?.about || ""
        };
        setForm(loaded);
        setSavedForm(loaded);
        setPhotoPath(data.profile?.photo_path || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load your profile right now");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const loadResumes = async () => {
      setResumesLoading(true);
      try {
        const data = await getMyResumes();
        setResumes(data.resumes || []);
      } catch (err) {
        setResumeActionError(err?.response?.data?.message || "Unable to load resumes");
      } finally {
        setResumesLoading(false);
      }
    };
    loadResumes();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };
  const handleEdit = () => {
    setError("");
    setSuccessMessage("");
    setEditing(true);
  };
  const handleCancel = () => {
    setForm(savedForm);
    setError("");
    setSuccessMessage("");
    setEditing(false);
  };
  const handleSave = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
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
      setSavedForm(form);
      setEditing(false);
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
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const handleRequestRemovePhoto = () => {
    setPhotoRemoveConfirmOpen(true);
  };
  const handleConfirmRemovePhoto = async () => {
    setPhotoRemoving(true);
    try {
      await removeProfilePhoto();
      setPhotoPath(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to remove photo");
    } finally {
      setPhotoRemoving(false);
      setPhotoRemoveConfirmOpen(false);
    }
  };

  const clearResumeMessages = () => {
    setResumeActionError("");
    setResumeActionSuccess("");
  };
  const handleAddResumeClick = () => {
    clearResumeMessages();
    addResumeInputRef.current?.click();
  };
  const handleAddResumeFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAddingResume(true);
    clearResumeMessages();
    try {
      const data = await addResume(file, file.name.replace(/\.[^/.]+$/, ""));
      setResumes((prev) => {
        const merged = data.resume.is_default
          ? [data.resume, ...prev.map((r) => ({ ...r, is_default: false }))]
          : [...prev, data.resume];
        return merged.sort(
          (a, b) => (b.is_default === a.is_default ? new Date(b.uploaded_at) - new Date(a.uploaded_at) : b.is_default - a.is_default)
        );
      });
      setResumeActionSuccess("Resume uploaded successfully");
    } catch (err) {
      setResumeActionError(err?.response?.data?.message || "Unable to upload resume");
    } finally {
      setAddingResume(false);
      if (addResumeInputRef.current) addResumeInputRef.current.value = "";
    }
  };
  const handleRequestReplace = (resume) => {
    clearResumeMessages();
    replaceTargetIdRef.current = resume.id;
    replaceResumeInputRef.current?.click();
  };
  const handleReplaceFile = async (e) => {
    const file = e.target.files?.[0];
    const targetId = replaceTargetIdRef.current;
    if (!file || !targetId) return;
    setBusyResumeId(targetId);
    clearResumeMessages();
    try {
      const data = await replaceResumeById(targetId, file);
      setResumes((prev) => prev.map((r) => (r.id === targetId ? { ...r, ...data.resume } : r)));
      setResumeActionSuccess("Resume replaced successfully");
    } catch (err) {
      setResumeActionError(err?.response?.data?.message || "Unable to replace resume");
    } finally {
      setBusyResumeId(null);
      replaceTargetIdRef.current = null;
      if (replaceResumeInputRef.current) replaceResumeInputRef.current.value = "";
    }
  };
  const handleSetDefault = async (resume) => {
    if (resume.is_default) return;
    setBusyResumeId(resume.id);
    clearResumeMessages();
    try {
      await setDefaultResumeById(resume.id);
      setResumes((prev) => prev.map((r) => ({ ...r, is_default: r.id === resume.id })));
      setResumeActionSuccess("Default resume updated");
    } catch (err) {
      setResumeActionError(err?.response?.data?.message || "Unable to set default resume");
    } finally {
      setBusyResumeId(null);
    }
  };
  const handleView = (resume) => {
    window.open(`${API_ORIGIN}${resume.resume_path}`, "_blank", "noreferrer");
  };
  const handleDownload = async (resume) => {
    setBusyResumeId(resume.id);
    clearResumeMessages();
    try {
      const response = await downloadResumeById(resume.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = resume.resume_filename || resume.resume_name || "resume";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setResumeActionError(err?.response?.data?.message || "Unable to download resume");
    } finally {
      setBusyResumeId(null);
    }
  };
  const handleRequestDelete = (resume) => {
    clearResumeMessages();
    setDeleteTarget(resume);
  };
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const resumeId = deleteTarget.id;
    setBusyResumeId(resumeId);
    try {
      await deleteResumeById(resumeId);
      setResumes((prev) => {
        const remaining = prev.filter((r) => r.id !== resumeId);
        if (deleteTarget.is_default && remaining.length > 0) {
          return remaining.map((r, idx) => (idx === 0 ? { ...r, is_default: true } : r));
        }
        return remaining;
      });
      setResumeActionSuccess("Resume deleted successfully");
    } catch (err) {
      setResumeActionError(err?.response?.data?.message || "Unable to delete resume");
    } finally {
      setBusyResumeId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <UserDashboardLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-heading">
              My Profile
            </h1>
            <p className="text-body mt-2">
              Complete your profile to improve your job recommendations.
            </p>
          </div>
          {!loading && !editing && (
            <ProfileActionButtons editing={false} onEdit={handleEdit} />
          )}
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
        <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Left: summary / contact card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-border shadow-sm p-8 text-center lg:sticky lg:top-6">
              <div className="relative w-28 h-28 mx-auto">
                {photoPath ? (
                  <img
                    src={`${API_ORIGIN}${photoPath}`}
                    alt="Profile"
                    className="w-28 h-28 rounded-full border-2 border-border object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-600 text-sm">No Photo</span>
                  </div>
                )}
                {editing && photoPath && (
                  <button
                    type="button"
                    onClick={handleRequestRemovePhoto}
                    disabled={photoRemoving}
                    title="Remove photo"
                    aria-label="Remove photo"
                    className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white border border-border shadow-soft flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-300 transition disabled:opacity-50"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                className="hidden"
              />
              {editing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-hover text-sm font-medium"
                  >
                    Upload Photo
                  </button>
                  <p className="text-xs text-body mt-2">JPG, PNG (Max 2MB)</p>
                </>
              )}

              <div className="mt-6 pt-6 border-t border-border text-left space-y-5">
                <ProfileField label="Full Name" value={form.fullname} editing={false} />
                <ProfileField label="Email" value={form.email} editing={false} />
                <ProfileField label="Phone" value={form.phone} editing={false} />
                <ProfileField label="Location" value={form.location} editing={editing}>
                  <input
                    className="w-full border border-border rounded-lg px-4 py-3"
                    name="location" id="location"
                    value={form.location}
                    onChange={handleChange}
                  />
                </ProfileField>
              </div>
            </div>
          </div>

          {/* Right: professional details, about, resume */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-border shadow-sm p-8">
              <h2 className="text-lg font-semibold text-heading mb-6">Professional Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <ProfileField label="Qualification" value={form.qualification} editing={editing}>
                  <input
                    className="w-full border border-border rounded-lg px-4 py-3"
                    name="qualification" id="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                  />
                </ProfileField>
                <ProfileField label="Specialization" value={form.specialization} editing={editing}>
                  <input
                    className="w-full border border-border rounded-lg px-4 py-3"
                    name="specialization" id="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                  />
                </ProfileField>
                <ProfileField label="Skills" value={form.skills} editing={editing} span>
                  <input
                    className="w-full border border-border rounded-lg px-4 py-3"
                    name="skills" id="skills"
                    value={form.skills}
                    placeholder="React, Java, Python..."
                    onChange={handleChange}
                  />
                </ProfileField>
                <ProfileField label="GitHub" value={form.github} editing={editing}>
                  <input
                    className="w-full border border-border rounded-lg px-4 py-3"
                    name="github" id="github"
                    value={form.github}
                    onChange={handleChange}
                  />
                </ProfileField>
                <ProfileField label="LinkedIn" value={form.linkedin} editing={editing}>
                  <input
                    className="w-full border border-border rounded-lg px-4 py-3"
                    name="linkedin" id="linkedin"
                    value={form.linkedin}
                    onChange={handleChange}
                  />
                </ProfileField>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm p-8">
              <h2 className="text-lg font-semibold text-heading mb-6">About Me</h2>
              <ProfileField label="" value={form.about} editing={editing} multiline span>
                <textarea
                  rows={5}
                  className="w-full border border-border rounded-lg px-4 py-3"
                  name="about" id="aboutme"
                  value={form.about}
                  onChange={handleChange}
                />
              </ProfileField>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm p-8">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
                <h2 className="text-lg font-semibold text-heading">Resumes</h2>
                <button
                  type="button"
                  onClick={handleAddResumeClick}
                  disabled={addingResume}
                  className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
                >
                  <Plus size={16} />
                  {addingResume ? "Uploading..." : "Add Resume"}
                </button>
                <input
                  id="add-resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  ref={addResumeInputRef}
                  onChange={handleAddResumeFile}
                  className="hidden"
                />
                <input
                  id="replace-resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  ref={replaceResumeInputRef}
                  onChange={handleReplaceFile}
                  className="hidden"
                />
              </div>
              {resumeActionError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 mb-4 text-sm">
                  {resumeActionError}
                </div>
              )}
              {resumeActionSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 mb-4 text-sm">
                  {resumeActionSuccess}
                </div>
              )}
              {resumesLoading ? (
                <p className="text-sm text-body">Loading resumes...</p>
              ) : resumes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center">
                  <p className="text-sm text-body">No resumes uploaded yet.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Add a resume so recruiters can find and shortlist you.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="rounded-xl bg-white border border-border shadow-soft px-5 py-4 flex items-start gap-3 hover:shadow-card transition"
                    >
                      <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-heading truncate" title={resume.resume_name}>
                            {resume.resume_name}
                          </p>
                          {resume.is_default && (
                            <span className="inline-flex items-center bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                              Default
                            </span>
                          )}
                        </div>
                        {formatResumeDate(resume.uploaded_at) && (
                          <p className="text-xs text-body mt-0.5">
                            Uploaded on {formatResumeDate(resume.uploaded_at)}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 -mr-1 -mt-1">
                        <ActionMenu
                          items={[
                            {
                              key: "view",
                              label: "View Resume",
                              onClick: () => handleView(resume)
                            },
                            {
                              key: "download",
                              label: "Download Resume",
                              disabled: busyResumeId === resume.id,
                              onClick: () => handleDownload(resume)
                            },
                            {
                              key: "replace",
                              label: "Replace Resume",
                              disabled: busyResumeId === resume.id,
                              onClick: () => handleRequestReplace(resume)
                            },
                            {
                              key: "default",
                              label: "Set as Default",
                              hidden: resume.is_default,
                              disabled: busyResumeId === resume.id,
                              onClick: () => handleSetDefault(resume)
                            },
                            {
                              key: "delete",
                              label: "Delete Resume",
                              danger: true,
                              disabled: busyResumeId === resume.id,
                              onClick: () => handleRequestDelete(resume)
                            }
                          ]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {editing && (
              <ProfileActionButtons
                editing={true}
                saving={saving}
                onCancel={handleCancel}
                onSave={handleSave}
              />
            )}
          </div>
        </form>
        )}
      </div>
      <ConfirmDialog
        open={photoRemoveConfirmOpen}
        title="Remove Profile Photo"
        message="Are you sure you want to remove your profile photo? This will restore the default avatar."
        confirmLabel={photoRemoving ? "Removing..." : "Remove"}
        danger
        onCancel={() => setPhotoRemoveConfirmOpen(false)}
        onConfirm={handleConfirmRemovePhoto}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Resume"
        message={`Are you sure you want to delete "${deleteTarget?.resume_name || "this resume"}"? This action cannot be undone.`}
        confirmLabel={busyResumeId === deleteTarget?.id ? "Deleting..." : "Delete"}
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </UserDashboardLayout>
  );
};
export default Profile;
