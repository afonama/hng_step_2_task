import { useState, useEffect, useRef } from "react";
import { IconArrowDown } from "../Icons";
import "./SelectField.css";

export default function SelectField({ label, id, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="select-field" ref={ref}>
      <label htmlFor={id} className="select-field__label">
        {label}
      </label>
      <button
        type="button"
        id={id}
        className={`select-field__trigger ${open ? "select-field__trigger--open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span>{options.find((o) => o.value === value)?.label || ""}</span>
        <span className={`select-field__arrow ${open ? "select-field__arrow--open" : ""}`}>
          <IconArrowDown />
        </span>
      </button>

      {open && (
        <div className="select-field__dropdown">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="select-field__option"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
