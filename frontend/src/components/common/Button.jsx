const Button = ({ children, type = "button", variant = "primary", fullWidth = false, disabled = false, onClick, className = "", size = "md" }) => {
  const base = size === "lg"
    ? (variant === "primary" ? "btn-nav-primary" : "btn-nav-outline")
    : (variant === "primary" ? "btn-primary" : "btn-outline");
  const width = fullWidth ? "w-full" : "";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${width} ${className}`}
    >
      {children}
    </button>
  );
};
export default Button;
