import "./FormField.css";

export default function FormField({
  label,
  id,
  value,
  onChange,
  error,
  type = "text",
  placeholder = "",
  className = "",
  disabled = false,
}) {
  return (
    <div className={`form-field ${className}`}>
      <div className="form-field__header">
        <label
          htmlFor={id}
          className={`form-field__label ${error ? "form-field__label--error" : ""}`}
        >
          {label}
        </label>
        {error && <span className="form-field__error">{error}</span>}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-field__input ${error ? "form-field__input--error" : ""}`}
      />
    </div>
  );
}
