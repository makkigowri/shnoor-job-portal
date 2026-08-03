const ProfileField = ({ label, value, editing, span = false, multiline = false, children }) => {
  const displayValue =
    value !== undefined && value !== null && String(value).trim() !== "" ? value : null;
  return (
    <div className={span ? "md:col-span-2" : ""}>
      {label ? <p className="text-sm font-medium text-gray-500 mb-1.5">{label}</p> : null}
      {editing ? (
        children
      ) : multiline ? (
        <p className="text-base text-gray-900 leading-relaxed whitespace-pre-line">
          {displayValue || <span className="text-gray-400 italic">Not provided</span>}
        </p>
      ) : (
        <p className="text-base font-semibold text-gray-900 break-words">
          {displayValue || <span className="text-gray-400 italic font-normal">Not provided</span>}
        </p>
      )}
    </div>
  );
};
export default ProfileField;
