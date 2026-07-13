const Select = ({ label, name, value, onChange, options, required = false }) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-heading mb-1.5">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      <select id={name} name={name} value={value} onChange={onChange} className="input-field bg-white">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
export default Select;
