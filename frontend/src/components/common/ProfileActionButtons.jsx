const ProfileActionButtons = ({
  editing,
  saving = false,
  onEdit,
  onCancel,
  onSave,
  primaryClassName = "bg-primary text-white hover:bg-primary-hover",
  outlineClassName = "border border-border text-heading hover:bg-gray-50"
}) => {
  if (!editing) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className={`px-6 py-2.5 rounded-lg font-medium transition ${primaryClassName}`}
      >
        Edit Profile
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className={`px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${primaryClassName}`}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className={`px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-60 ${outlineClassName}`}
      >
        Cancel
      </button>
    </div>
  );
};
export default ProfileActionButtons;
