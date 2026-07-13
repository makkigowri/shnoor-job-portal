const Checkbox = ({ name, checked, onChange, label }) => {
  return (
    <label htmlFor={name} className="flex items-start gap-2 text-sm text-body cursor-pointer select-none">
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
      />
      <span>{label}</span>
    </label>
  );
};
export default Checkbox;
