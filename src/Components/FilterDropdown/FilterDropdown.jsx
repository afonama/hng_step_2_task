import { useState, useEffect, useRef } from "react";
import useWindowWidth from "../../hooks/useWindowWidth";
import { IconArrowDown, IconCheck } from "../Icons";
import "./FilterDropdown.css";

const STATUSES = ["draft", "pending", "paid"];

export default function FilterDropdown({ filters, setFilters }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { isMobile } = useWindowWidth();

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggle = (status) => {
    setFilters((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  return (
    <div className="filter" ref={ref}>
      <button className="filter__trigger" onClick={() => setOpen(!open)}>
        <span>{isMobile ? "Filter" : "Filter by status"}</span>
        <span className={`filter__arrow ${open ? "filter__arrow--open" : ""}`}>
          <IconArrowDown />
        </span>
      </button>

      {open && (
        <div className="filter__dropdown">
          {STATUSES.map((s) => (
            <label key={s} className="filter__option">
              <span
                className={`filter__checkbox ${
                  filters[s] ? "filter__checkbox--checked" : "filter__checkbox--unchecked"
                }`}
                onClick={() => toggle(s)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    toggle(s);
                  }
                }}
                role="checkbox"
                aria-checked={filters[s]}
                tabIndex={0}
              >
                {filters[s] && <IconCheck />}
              </span>
              {s}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
