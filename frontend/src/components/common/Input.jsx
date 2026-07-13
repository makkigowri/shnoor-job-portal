const Input = ({ label, type = "text", name, value, onChange, placeholder, error, required = false }) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-heading mb-1.5">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
      />
      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
};
export default Input;
