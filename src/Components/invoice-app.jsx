import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// ─── Theme Context ───
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

// ─── Constants ───
const STORAGE_KEY = "invoice_app_data";
const THEME_KEY = "invoice_app_theme";

const SAMPLE_INVOICES = [
  {
    id: "RT3080",
    createdAt: "2021-08-18",
    paymentDue: "2021-08-19",
    description: "Re-branding",
    paymentTerms: 1,
    clientName: "Jensen Huang",
    clientEmail: "jensenh@mail.com",
    status: "paid",
    senderAddress: { street: "19 Union Terrace", city: "London", postCode: "E1 3EZ", country: "United Kingdom" },
    clientAddress: { street: "106 Kendell Street", city: "Shargatown", postCode: "NI24 5PE", country: "United Kingdom" },
    items: [{ name: "Brand Guidelines", quantity: 1, price: 1800.9, total: 1800.9 }],
    total: 1800.9,
  },
  {
    id: "XM9141",
    createdAt: "2021-08-21",
    paymentDue: "2021-09-20",
    description: "Graphic Design",
    paymentTerms: 30,
    clientName: "Alex Grim",
    clientEmail: "alexgrim@mail.com",
    status: "pending",
    senderAddress: { street: "19 Union Terrace", city: "London", postCode: "E1 3EZ", country: "United Kingdom" },
    clientAddress: { street: "84 Church Way", city: "Bradford", postCode: "BD1 9PB", country: "United Kingdom" },
    items: [
      { name: "Banner Design", quantity: 1, price: 156.0, total: 156.0 },
      { name: "Email Design", quantity: 2, price: 200.0, total: 400.0 },
    ],
    total: 556.0,
  },
  {
    id: "RG0314",
    createdAt: "2021-09-24",
    paymentDue: "2021-10-01",
    description: "Website Redesign",
    paymentTerms: 7,
    clientName: "John Morrison",
    clientEmail: "jm@myco.com",
    status: "paid",
    senderAddress: { street: "19 Union Terrace", city: "London", postCode: "E1 3EZ", country: "United Kingdom" },
    clientAddress: { street: "79 Dover Road", city: "Westhall", postCode: "IP19 3PF", country: "United Kingdom" },
    items: [
      { name: "Website Redesign", quantity: 1, price: 14002.33, total: 14002.33 },
    ],
    total: 14002.33,
  },
  {
    id: "FV2353",
    createdAt: "2021-11-05",
    paymentDue: "2021-11-12",
    description: "Logo Concept",
    paymentTerms: 7,
    clientName: "Anita Wainwright",
    clientEmail: "",
    status: "draft",
    senderAddress: { street: "19 Union Terrace", city: "London", postCode: "E1 3EZ", country: "United Kingdom" },
    clientAddress: { street: "", city: "", postCode: "", country: "" },
    items: [{ name: "Logo Sketches", quantity: 1, price: 102.04, total: 102.04 }],
    total: 102.04,
  },
  {
    id: "AA1449",
    createdAt: "2021-10-07",
    paymentDue: "2021-10-14",
    description: "Re-branding",
    paymentTerms: 7,
    clientName: "Mellisa Clarke",
    clientEmail: "mellisaclarke@example.com",
    status: "pending",
    senderAddress: { street: "19 Union Terrace", city: "London", postCode: "E1 3EZ", country: "United Kingdom" },
    clientAddress: { street: "46 Abbey Row", city: "Cambridge", postCode: "CB5 6EG", country: "United Kingdom" },
    items: [
      { name: "New Logo", quantity: 1, price: 1532.33, total: 1532.33 },
      { name: "Brand Guidelines", quantity: 1, price: 2500.0, total: 2500.0 },
    ],
    total: 4032.33,
  },
  {
    id: "TY9141",
    createdAt: "2021-10-01",
    paymentDue: "2021-10-31",
    description: "Landing Page Design",
    paymentTerms: 30,
    clientName: "Thomas Wayne",
    clientEmail: "thomas@dc.com",
    status: "pending",
    senderAddress: { street: "19 Union Terrace", city: "London", postCode: "E1 3EZ", country: "United Kingdom" },
    clientAddress: { street: "3964 Queens Lane", city: "Gotham", postCode: "60457", country: "United States of America" },
    items: [
      { name: "Web Design", quantity: 1, price: 6155.91, total: 6155.91 },
    ],
    total: 6155.91,
  },
];

// ─── Helpers ───
function generateId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const l1 = letters[Math.floor(Math.random() * 26)];
  const l2 = letters[Math.floor(Math.random() * 26)];
  const nums = String(Math.floor(1000 + Math.random() * 9000));
  return l1 + l2 + nums;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(amount) {
  return "£ " + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function loadInvoices() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && stored.length > 0) return stored;
  } catch {}
  return SAMPLE_INVOICES;
}

function saveInvoices(invoices) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "dark";
  } catch { return "dark"; }
}

// ─── SVG Icons ───
const IconArrowDown = () => (
  <svg width="11" height="7" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l4.228 4.228L9.456 1" stroke="#7C5DFA" strokeWidth="2" fill="none"/></svg>
);
const IconArrowLeft = () => (
  <svg width="7" height="10" xmlns="http://www.w3.org/2000/svg"><path d="M6.342.886L2.114 5.114l4.228 4.228" stroke="#7C5DFA" strokeWidth="2" fill="none"/></svg>
);
const IconArrowRight = () => (
  <svg width="7" height="10" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l4 4-4 4" stroke="#7C5DFA" strokeWidth="2" fill="none"/></svg>
);
const IconPlus = () => (
  <svg width="11" height="11" xmlns="http://www.w3.org/2000/svg"><path d="M6.313 10.023v-3.71h3.71v-2.58h-3.71V.023h-2.58v3.71H.023v2.58h3.71v3.71z" fill="#7C5DFA"/></svg>
);
const IconDelete = () => (
  <svg width="13" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M11.583 3.556v10.666c0 .982-.795 1.778-1.778 1.778H2.694a1.778 1.778 0 01-1.778-1.778V3.556h10.667zM8.473 0l.888.889h3.111v1.778H.028V.889h3.11L4.029 0h4.444z" fill="#888EB0" fillRule="nonzero"/></svg>
);
const IconCheck = () => (
  <svg width="10" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 4.5l2.124 2.124L8.97 1.28" stroke="#FFF" strokeWidth="2" fill="none"/></svg>
);
const IconSun = () => (
  <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M9.817 16.18a.96.96 0 01.953.848l.007.112v1.535a.96.96 0 01-1.913.112l-.006-.112V17.14a.96.96 0 01.96-.96zm-4.5-1.863c.347.346.373.89.08 1.266l-.08.09-1.085 1.087a.96.96 0 01-1.437-1.267l.08-.09 1.086-1.086a.959.959 0 011.356 0zm10.356 0l1.086 1.086a.959.959 0 11-1.357 1.357l-1.085-1.086a.959.959 0 111.356-1.357zM9.817 4.9a4.924 4.924 0 014.918 4.918 4.924 4.924 0 01-4.918 4.918A4.924 4.924 0 014.9 9.818 4.924 4.924 0 019.817 4.9zm8.858 3.958a.96.96 0 110 1.919H17.14a.96.96 0 110-1.92h1.535zm-16.18 0a.96.96 0 01.112 1.912l-.112.007H.96a.96.96 0 01-.112-1.913l.112-.006h1.534zm14.264-5.983a.96.96 0 010 1.357l-1.086 1.086a.96.96 0 11-1.356-1.357l1.085-1.086a.96.96 0 011.357 0zm-12.617 0l1.086 1.086a.96.96 0 01-1.357 1.357L2.785 4.232a.96.96 0 011.357-1.357zM9.817 0a.96.96 0 01.953.848l.007.112v1.534a.96.96 0 01-1.913.113l-.006-.113V.96A.96.96 0 019.817 0z" fill="#858BB2" fillRule="nonzero"/></svg>
);
const IconMoon = () => (
  <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M19.502 11.342a.703.703 0 00-.588.128 7.499 7.499 0 01-2.275 1.33 7.123 7.123 0 01-2.581.46A7.516 7.516 0 016.542 6.29 7.207 7.207 0 017.128 3.2a7.066 7.066 0 011.752-1.934.69.69 0 00-.035-1.173A.688.688 0 008.4 0a10.045 10.045 0 00-5.084 2.398A10.12 10.12 0 000 9.93a10.02 10.02 0 002.984 7.16 10.027 10.027 0 007.095 2.91c2.27 0 4.44-.737 6.295-2.135a10.077 10.077 0 003.628-5.676.69.69 0 00-.5-.847z" fill="#7E88C3" fillRule="nonzero"/></svg>
);
const IconEmpty = () => (
  <svg width="242" height="200" viewBox="0 0 242 200" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M58.845 17.22c15.95 0 28.874 12.925 28.874 28.874 0 15.95-12.925 28.874-28.874 28.874S29.97 62.043 29.97 46.094c0-15.95 12.925-28.874 28.874-28.874z" fill="#C4C9E1" opacity=".5"/>
      <path d="M163.17 86.81l-16.34 96.55H95.17l-16.34-96.55z" fill="#CCC"/>
      <path d="M121 86.81l-25.83 96.55h-25.83L121 86.81z" fill="#B8B8B8" opacity=".5"/>
      <path d="M79.26 183.36h83.48v8.88H79.26z" fill="#CCC"/>
      <path d="M79.26 183.36h41.74v8.88H79.26z" fill="#B8B8B8" opacity=".5"/>
      <rect fill="#7C5DFA" opacity=".1" x="0" y="183.36" width="242" height="16.64" rx="8.32"/>
    </g>
  </svg>
);

// ─── Styles ───
const getStyles = (theme) => {
  const isDark = theme === "dark";
  const c = {
    bg: isDark ? "#141625" : "#F8F8FB",
    cardBg: isDark ? "#1E2139" : "#FFFFFF",
    sidebarBg: isDark ? "#1E2139" : "#373B53",
    formBg: isDark ? "#141625" : "#FFFFFF",
    inputBg: isDark ? "#1E2139" : "#FFFFFF",
    inputBorder: isDark ? "#252945" : "#DFE3FA",
    textPrimary: isDark ? "#FFFFFF" : "#0C0E16",
    textSecondary: isDark ? "#DFE3FA" : "#888EB0",
    textMuted: isDark ? "#888EB0" : "#7E88C3",
    popupBg: isDark ? "#252945" : "#FFFFFF",
    popupShadow: isDark ? "0 10px 20px rgba(0,0,0,0.25)" : "0 10px 20px rgba(72,84,159,0.25)",
    invoiceItemBg: isDark ? "#252945" : "#F9FAFE",
    invoiceTotalBg: isDark ? "#0C0E16" : "#373B53",
    btnDraft: isDark ? "#373B53" : "#373B53",
    btnDraftHover: isDark ? "#1E2139" : "#0C0E16",
    scrollTrack: isDark ? "#141625" : "#DFE3FA",
    divider: isDark ? "#252945" : "#DFE3FA",
    deleteBtn: "#EC5757",
    deleteBtnHover: "#FF9797",
    purple: "#7C5DFA",
    purpleLight: "#9277FF",
    green: "#33D69F",
    orange: "#FF8F00",
    draftText: isDark ? "#DFE3FA" : "#373B53",
    draftBg: isDark ? "rgba(223,227,250,0.06)" : "rgba(55,59,83,0.06)",
    pendingBg: "rgba(255,143,0,0.06)",
    paidBg: "rgba(51,214,159,0.06)",
    overlayBg: "rgba(0,0,0,0.5)",
    errorRed: "#EC5757",
  };
  return c;
};

// ─── CSS-in-JS helper ───
const css = `
  @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'League Spartan', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-thumb { background: #7C5DFA; border-radius: 4px; }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type="number"] { -moz-appearance: textfield; }

  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
`;

// ─── Status Badge ───
function StatusBadge({ status }) {
  const c = useTheme();
  const colors = {
    paid: { bg: c.paidBg, text: c.green, dot: c.green },
    pending: { bg: c.pendingBg, text: c.orange, dot: c.orange },
    draft: { bg: c.draftBg, text: c.draftText, dot: c.draftText },
  };
  const s = colors[status] || colors.draft;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      width: "104px", height: "40px", borderRadius: "6px",
      backgroundColor: s.bg, fontWeight: 700, fontSize: "15px", lineHeight: "15px",
      letterSpacing: "-0.25px", textTransform: "capitalize",
    }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: s.dot }} />
      <span style={{ color: s.text, paddingTop: "3px" }}>{status}</span>
    </div>
  );
}

// ─── Delete Modal ───
function DeleteModal({ invoiceId, onConfirm, onCancel }) {
  const c = useTheme();
  const modalRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll("button");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="delete-title" style={{
      position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: c.overlayBg,
    }} onClick={onCancel}>
      <div ref={modalRef} onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: c.cardBg, borderRadius: "8px", padding: "48px", maxWidth: "480px", width: "90%",
        boxShadow: c.popupShadow,
      }}>
        <h2 id="delete-title" style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.5px", color: c.textPrimary, marginBottom: "12px" }}>
          Confirm Deletion
        </h2>
        <p style={{ fontSize: "13px", lineHeight: "22px", letterSpacing: "-0.1px", color: c.textSecondary }}>
          Are you sure you want to delete invoice #{invoiceId}? This action cannot be undone.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "22px" }}>
          <button ref={cancelRef} onClick={onCancel} style={{
            padding: "16px 24px", borderRadius: "24px", border: "none", cursor: "pointer",
            fontFamily: "inherit", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.25px",
            backgroundColor: isDk(c) ? "#252945" : "#F9FAFE", color: c.textMuted,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = isDk(c) ? "#1E2139" : "#DFE3FA"}
          onMouseLeave={(e) => e.target.style.backgroundColor = isDk(c) ? "#252945" : "#F9FAFE"}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            padding: "16px 24px", borderRadius: "24px", border: "none", cursor: "pointer",
            fontFamily: "inherit", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.25px",
            backgroundColor: c.deleteBtn, color: "#FFFFFF", transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = c.deleteBtnHover}
          onMouseLeave={(e) => e.target.style.backgroundColor = c.deleteBtn}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function isDk(c) { return c.bg === "#141625"; }

// ─── Form Field ───
function FormField({ label, id, value, onChange, error, type = "text", placeholder = "", style: wrapStyle }) {
  const c = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", ...wrapStyle }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label htmlFor={id} style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.1px", color: error ? c.errorRed : c.textMuted }}>
          {label}
        </label>
        {error && <span style={{ fontSize: "10px", fontWeight: 600, color: c.errorRed }}>{error}</span>}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%", height: "48px", padding: "0 20px", borderRadius: "4px",
          border: `1px solid ${error ? c.errorRed : c.inputBorder}`,
          backgroundColor: c.inputBg, color: c.textPrimary,
          fontFamily: "inherit", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.25px",
          outline: "none", transition: "border-color 0.2s",
        }}
        onFocus={(e) => { if (!error) e.target.style.borderColor = c.purple; }}
        onBlur={(e) => { e.target.style.borderColor = error ? c.errorRed : c.inputBorder; }}
      />
    </div>
  );
}

// ─── Select Field ───
function SelectField({ label, id, value, onChange, options, error }) {
  const c = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "10px", position: "relative" }}>
      <label htmlFor={id} style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.1px", color: error ? c.errorRed : c.textMuted }}>
        {label}
      </label>
      <button
        type="button"
        id={id}
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", height: "48px", padding: "0 20px", borderRadius: "4px",
          border: `1px solid ${open ? c.purple : error ? c.errorRed : c.inputBorder}`,
          backgroundColor: c.inputBg, color: c.textPrimary, cursor: "pointer",
          fontFamily: "inherit", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.25px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "border-color 0.2s",
        }}
      >
        <span>{options.find(o => o.value === value)?.label || ""}</span>
        <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}><IconArrowDown /></span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 10,
          backgroundColor: c.popupBg, borderRadius: "8px", boxShadow: c.popupShadow,
          overflow: "hidden",
        }}>
          {options.map((opt, i) => (
            <button key={opt.value} type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                width: "100%", padding: "16px 24px", border: "none",
                borderBottom: i < options.length - 1 ? `1px solid ${c.divider}` : "none",
                backgroundColor: "transparent", color: c.textPrimary, cursor: "pointer",
                fontFamily: "inherit", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.25px",
                textAlign: "left", transition: "color 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.color = c.purple}
              onMouseLeave={(e) => e.target.style.color = c.textPrimary}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Invoice Form ───
function InvoiceForm({ invoice, onSave, onCancel, sidebarWidth }) {
  const c = useTheme();
  const formRef = useRef(null);
  const isEdit = !!invoice;

  const emptyItem = { name: "", quantity: "", price: "", total: 0 };
  const defaultForm = {
    senderStreet: "", senderCity: "", senderPostCode: "", senderCountry: "",
    clientName: "", clientEmail: "",
    clientStreet: "", clientCity: "", clientPostCode: "", clientCountry: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    paymentTerms: 30,
    description: "",
    items: [{ ...emptyItem }],
  };

  const [form, setForm] = useState(() => {
    if (invoice) return {
      senderStreet: invoice.senderAddress.street,
      senderCity: invoice.senderAddress.city,
      senderPostCode: invoice.senderAddress.postCode,
      senderCountry: invoice.senderAddress.country,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientStreet: invoice.clientAddress.street,
      clientCity: invoice.clientAddress.city,
      clientPostCode: invoice.clientAddress.postCode,
      clientCountry: invoice.clientAddress.country,
      invoiceDate: invoice.createdAt,
      paymentTerms: invoice.paymentTerms,
      description: invoice.description,
      items: invoice.items.map(it => ({ name: it.name, quantity: String(it.quantity), price: String(it.price), total: it.total })),
    };
    return defaultForm;
  });

  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const setItem = (idx, field, val) => {
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: val };
      if (field === "quantity" || field === "price") {
        const q = parseFloat(items[idx].quantity) || 0;
        const p = parseFloat(items[idx].price) || 0;
        items[idx].total = q * p;
      }
      return { ...prev, items };
    });
  };

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));
  const removeItem = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const validate = (asDraft) => {
    const e = {};
    const ie = {};
    if (!asDraft) {
      if (!form.senderStreet.trim()) e.senderStreet = "can't be empty";
      if (!form.senderCity.trim()) e.senderCity = "can't be empty";
      if (!form.senderPostCode.trim()) e.senderPostCode = "can't be empty";
      if (!form.senderCountry.trim()) e.senderCountry = "can't be empty";
      if (!form.clientName.trim()) e.clientName = "can't be empty";
      if (!form.clientEmail.trim()) e.clientEmail = "can't be empty";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail)) e.clientEmail = "invalid email";
      if (!form.clientStreet.trim()) e.clientStreet = "can't be empty";
      if (!form.clientCity.trim()) e.clientCity = "can't be empty";
      if (!form.clientPostCode.trim()) e.clientPostCode = "can't be empty";
      if (!form.clientCountry.trim()) e.clientCountry = "can't be empty";
      if (!form.invoiceDate) e.invoiceDate = "can't be empty";
      if (!form.description.trim()) e.description = "can't be empty";
      if (form.items.length === 0) e.items = "An item must be added";
      form.items.forEach((item, idx) => {
        const itemE = {};
        if (!item.name.trim()) itemE.name = "can't be empty";
        if (!item.quantity || parseFloat(item.quantity) <= 0) itemE.quantity = "invalid";
        if (!item.price || parseFloat(item.price) <= 0) itemE.price = "invalid";
        if (Object.keys(itemE).length) ie[idx] = itemE;
      });
    }
    setErrors(e);
    setItemErrors(ie);
    return Object.keys(e).length === 0 && Object.keys(ie).length === 0;
  };

  const buildInvoice = (status) => ({
    id: invoice?.id || generateId(),
    createdAt: form.invoiceDate,
    paymentDue: addDays(form.invoiceDate, form.paymentTerms),
    description: form.description,
    paymentTerms: form.paymentTerms,
    clientName: form.clientName,
    clientEmail: form.clientEmail,
    status,
    senderAddress: { street: form.senderStreet, city: form.senderCity, postCode: form.senderPostCode, country: form.senderCountry },
    clientAddress: { street: form.clientStreet, city: form.clientCity, postCode: form.clientPostCode, country: form.clientCountry },
    items: form.items.map(it => ({
      name: it.name,
      quantity: parseFloat(it.quantity) || 0,
      price: parseFloat(it.price) || 0,
      total: (parseFloat(it.quantity) || 0) * (parseFloat(it.price) || 0),
    })),
    total: form.items.reduce((sum, it) => sum + ((parseFloat(it.quantity) || 0) * (parseFloat(it.price) || 0)), 0),
  });

  const handleSave = (asDraft = false) => {
    setAttemptedSubmit(true);
    if (!asDraft && !validate(false)) return;
    onSave(buildInvoice(asDraft ? "draft" : isEdit ? invoice.status : "pending"));
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  const termOptions = [
    { value: 1, label: "Net 1 Day" },
    { value: 7, label: "Net 7 Days" },
    { value: 14, label: "Net 14 Days" },
    { value: 30, label: "Net 30 Days" },
  ];

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, backgroundColor: c.overlayBg, zIndex: 50 }} onClick={onCancel} />
      <div ref={formRef} role="dialog" aria-modal="true" aria-label={isEdit ? "Edit Invoice" : "New Invoice"} style={{
        position: "fixed", top: 0, left: isMobile ? 0 : `${sidebarWidth}px`, bottom: 0,
        width: isMobile ? "100%" : "calc(min(720px, 100% - " + sidebarWidth + "px))",
        backgroundColor: c.formBg, zIndex: 60, overflowY: "auto",
        borderTopRightRadius: isMobile ? 0 : "20px", borderBottomRightRadius: isMobile ? 0 : "20px",
        padding: isMobile ? "32px 24px 190px" : "56px 56px 190px",
        paddingLeft: isMobile ? "24px" : "56px",
      }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.5px", color: c.textPrimary, marginBottom: "48px" }}>
          {isEdit ? (<>Edit <span style={{ color: c.textMuted }}>#</span>{invoice.id}</>) : "New Invoice"}
        </h2>

        {/* Bill From */}
        <p style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.25px", color: c.purple, marginBottom: "24px" }}>Bill From</p>
        <FormField label="Street Address" id="sender-street" value={form.senderStreet} onChange={(e) => set("senderStreet", e.target.value)} error={errors.senderStreet} />
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: "24px", marginTop: "24px" }}>
          <FormField label="City" id="sender-city" value={form.senderCity} onChange={(e) => set("senderCity", e.target.value)} error={errors.senderCity} />
          <FormField label="Post Code" id="sender-postcode" value={form.senderPostCode} onChange={(e) => set("senderPostCode", e.target.value)} error={errors.senderPostCode} />
          {isMobile ? null : <FormField label="Country" id="sender-country" value={form.senderCountry} onChange={(e) => set("senderCountry", e.target.value)} error={errors.senderCountry} />}
        </div>
        {isMobile && <div style={{ marginTop: "24px" }}><FormField label="Country" id="sender-country" value={form.senderCountry} onChange={(e) => set("senderCountry", e.target.value)} error={errors.senderCountry} /></div>}

        {/* Bill To */}
        <p style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.25px", color: c.purple, marginTop: "48px", marginBottom: "24px" }}>Bill To</p>
        <FormField label="Client's Name" id="client-name" value={form.clientName} onChange={(e) => set("clientName", e.target.value)} error={errors.clientName} />
        <div style={{ marginTop: "24px" }}>
          <FormField label="Client's Email" id="client-email" value={form.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} error={errors.clientEmail} placeholder="e.g. email@example.com" />
        </div>
        <div style={{ marginTop: "24px" }}>
          <FormField label="Street Address" id="client-street" value={form.clientStreet} onChange={(e) => set("clientStreet", e.target.value)} error={errors.clientStreet} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: "24px", marginTop: "24px" }}>
          <FormField label="City" id="client-city" value={form.clientCity} onChange={(e) => set("clientCity", e.target.value)} error={errors.clientCity} />
          <FormField label="Post Code" id="client-postcode" value={form.clientPostCode} onChange={(e) => set("clientPostCode", e.target.value)} error={errors.clientPostCode} />
          {isMobile ? null : <FormField label="Country" id="client-country" value={form.clientCountry} onChange={(e) => set("clientCountry", e.target.value)} error={errors.clientCountry} />}
        </div>
        {isMobile && <div style={{ marginTop: "24px" }}><FormField label="Country" id="client-country" value={form.clientCountry} onChange={(e) => set("clientCountry", e.target.value)} error={errors.clientCountry} /></div>}

        {/* Invoice Details */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px", marginTop: "48px" }}>
          <FormField label="Invoice Date" id="invoice-date" type="date" value={form.invoiceDate}
            onChange={(e) => set("invoiceDate", e.target.value)} error={errors.invoiceDate}
            style={isEdit ? { opacity: 0.5, pointerEvents: "none" } : {}} />
          <SelectField label="Payment Terms" id="payment-terms" value={form.paymentTerms}
            onChange={(v) => set("paymentTerms", v)} options={termOptions} />
        </div>
        <div style={{ marginTop: "24px" }}>
          <FormField label="Project Description" id="description" value={form.description}
            onChange={(e) => set("description", e.target.value)} error={errors.description} placeholder="e.g. Graphic Design Service" />
        </div>

        {/* Item List */}
        <h3 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.38px", color: "#777F98", marginTop: "32px", marginBottom: "16px" }}>Item List</h3>

        {!isMobile && form.items.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "214px 46px 100px 1fr 16px", gap: "16px", marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted }}>Item Name</span>
            <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted }}>Qty.</span>
            <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted }}>Price</span>
            <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted }}>Total</span>
            <span />
          </div>
        )}

        {form.items.map((item, idx) => (
          <div key={idx} style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "214px 46px 100px 1fr 16px",
            gap: isMobile ? "24px" : "16px",
            marginBottom: "18px", alignItems: "center",
          }}>
            {isMobile ? (
              <>
                <FormField label="Item Name" id={`item-name-${idx}`} value={item.name}
                  onChange={(e) => setItem(idx, "name", e.target.value)}
                  error={itemErrors[idx]?.name} />
                <div style={{ display: "grid", gridTemplateColumns: "64px 100px 1fr 16px", gap: "16px", alignItems: "center" }}>
                  <FormField label="Qty." id={`item-qty-${idx}`} type="number" value={item.quantity}
                    onChange={(e) => setItem(idx, "quantity", e.target.value)}
                    error={itemErrors[idx]?.quantity} />
                  <FormField label="Price" id={`item-price-${idx}`} type="number" value={item.price}
                    onChange={(e) => setItem(idx, "price", e.target.value)}
                    error={itemErrors[idx]?.price} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted }}>Total</span>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: c.textMuted, height: "48px", display: "flex", alignItems: "center" }}>
                      {(item.total || 0).toFixed(2)}
                    </span>
                  </div>
                  <button type="button" onClick={() => removeItem(idx)} aria-label="Delete item"
                    style={{ background: "none", border: "none", cursor: "pointer", marginTop: "28px", padding: "4px", transition: "opacity 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.querySelector("path") && (e.currentTarget.querySelector("path").style.fill = c.deleteBtn)}
                    onMouseLeave={(e) => e.currentTarget.querySelector("path") && (e.currentTarget.querySelector("path").style.fill = "#888EB0")}>
                    <IconDelete />
                  </button>
                </div>
              </>
            ) : (
              <>
                <input value={item.name} onChange={(e) => setItem(idx, "name", e.target.value)}
                  style={{
                    height: "48px", padding: "0 20px", borderRadius: "4px",
                    border: `1px solid ${itemErrors[idx]?.name ? c.errorRed : c.inputBorder}`,
                    backgroundColor: c.inputBg, color: c.textPrimary,
                    fontFamily: "inherit", fontWeight: 700, fontSize: "15px", outline: "none",
                  }} />
                <input type="number" value={item.quantity} onChange={(e) => setItem(idx, "quantity", e.target.value)}
                  style={{
                    height: "48px", padding: "0 8px", borderRadius: "4px", textAlign: "center",
                    border: `1px solid ${itemErrors[idx]?.quantity ? c.errorRed : c.inputBorder}`,
                    backgroundColor: c.inputBg, color: c.textPrimary,
                    fontFamily: "inherit", fontWeight: 700, fontSize: "15px", outline: "none",
                  }} />
                <input type="number" value={item.price} onChange={(e) => setItem(idx, "price", e.target.value)}
                  style={{
                    height: "48px", padding: "0 12px", borderRadius: "4px",
                    border: `1px solid ${itemErrors[idx]?.price ? c.errorRed : c.inputBorder}`,
                    backgroundColor: c.inputBg, color: c.textPrimary,
                    fontFamily: "inherit", fontWeight: 700, fontSize: "15px", outline: "none",
                  }} />
                <span style={{ fontSize: "15px", fontWeight: 700, color: c.textMuted, display: "flex", alignItems: "center" }}>
                  {(item.total || 0).toFixed(2)}
                </span>
                <button type="button" onClick={() => removeItem(idx)} aria-label="Delete item"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", transition: "opacity 0.2s" }}
                  onMouseEnter={(e) => { const p = e.currentTarget.querySelector("path"); if (p) p.style.fill = c.deleteBtn; }}
                  onMouseLeave={(e) => { const p = e.currentTarget.querySelector("path"); if (p) p.style.fill = "#888EB0"; }}>
                  <IconDelete />
                </button>
              </>
            )}
          </div>
        ))}

        <button type="button" onClick={addItem} style={{
          width: "100%", height: "48px", borderRadius: "24px", border: "none", cursor: "pointer",
          backgroundColor: isDk(c) ? "#252945" : "#F9FAFE", color: c.textMuted,
          fontFamily: "inherit", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.25px",
          marginTop: "8px", transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = isDk(c) ? "#1E2139" : "#DFE3FA"}
        onMouseLeave={(e) => e.target.style.backgroundColor = isDk(c) ? "#252945" : "#F9FAFE"}>
          + Add New Item
        </button>

        {attemptedSubmit && (Object.keys(errors).length > 0 || Object.keys(itemErrors).length > 0) && (
          <div style={{ marginTop: "32px" }}>
            <p style={{ fontSize: "10px", fontWeight: 600, color: c.errorRed, lineHeight: "15px" }}>- All fields must be added</p>
            {errors.items && <p style={{ fontSize: "10px", fontWeight: 600, color: c.errorRed, lineHeight: "15px" }}>- An item must be added</p>}
          </div>
        )}

        {/* Bottom Buttons */}
        <div style={{
          position: "fixed", bottom: 0, left: isMobile ? 0 : `${sidebarWidth}px`,
          width: isMobile ? "100%" : "calc(min(720px, 100% - " + sidebarWidth + "px))",
          padding: "22px 24px", display: "flex", justifyContent: isEdit ? "flex-end" : "space-between",
          alignItems: "center", gap: "8px",
          background: `linear-gradient(to top, ${c.formBg} 80%, transparent)`,
          borderBottomRightRadius: isMobile ? 0 : "20px",
        }}>
          {!isEdit && (
            <button type="button" onClick={onCancel} style={{
              padding: "16px 24px", borderRadius: "24px", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: "15px",
              backgroundColor: isDk(c) ? "#252945" : "#F9FAFE", color: c.textMuted,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = isDk(c) ? "#1E2139" : "#DFE3FA"}
            onMouseLeave={(e) => e.target.style.backgroundColor = isDk(c) ? "#252945" : "#F9FAFE"}>
              Discard
            </button>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            {isEdit && (
              <button type="button" onClick={onCancel} style={{
                padding: "16px 24px", borderRadius: "24px", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontWeight: 700, fontSize: "15px",
                backgroundColor: isDk(c) ? "#252945" : "#F9FAFE", color: c.textMuted,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = isDk(c) ? "#1E2139" : "#DFE3FA"}
              onMouseLeave={(e) => e.target.style.backgroundColor = isDk(c) ? "#252945" : "#F9FAFE"}>
                Cancel
              </button>
            )}
            {!isEdit && (
              <button type="button" onClick={() => handleSave(true)} style={{
                padding: "16px 24px", borderRadius: "24px", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontWeight: 700, fontSize: "15px",
                backgroundColor: c.btnDraft, color: "#888EB0",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = c.btnDraftHover}
              onMouseLeave={(e) => e.target.style.backgroundColor = c.btnDraft}>
                Save as Draft
              </button>
            )}
            <button type="button" onClick={() => handleSave(false)} style={{
              padding: "16px 24px", borderRadius: "24px", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: "15px",
              backgroundColor: c.purple, color: "#FFFFFF",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = c.purpleLight}
            onMouseLeave={(e) => e.target.style.backgroundColor = c.purple}>
              {isEdit ? "Save Changes" : "Save & Send"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Invoice Detail ───
function InvoiceDetail({ invoice, onBack, onEdit, onDelete, onMarkPaid }) {
  const c = useTheme();
  const [showDelete, setShowDelete] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div style={{ maxWidth: "730px", margin: "0 auto", width: "100%", padding: isMobile ? "32px 24px" : "32px 0" }}>
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: "24px", background: "none", border: "none",
        cursor: "pointer", marginBottom: "32px", fontFamily: "inherit", fontWeight: 700,
        fontSize: "15px", letterSpacing: "-0.25px", color: c.textPrimary,
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => e.target.style.color = c.textMuted}
      onMouseLeave={(e) => e.target.style.color = c.textPrimary}>
        <IconArrowLeft /> Go back
      </button>

      {/* Status Bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: isMobile ? "space-between" : "flex-start",
        gap: "16px", backgroundColor: c.cardBg, borderRadius: "8px", padding: "20px 32px",
        boxShadow: "0 10px 10px -10px rgba(72,84,159,0.1)", marginBottom: "24px",
      }}>
        <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted }}>Status</span>
        <StatusBadge status={invoice.status} />
        {!isMobile && (
          <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
            <button onClick={onEdit} style={{
              padding: "16px 24px", borderRadius: "24px", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: "15px",
              backgroundColor: isDk(c) ? "#252945" : "#F9FAFE", color: c.textMuted,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = isDk(c) ? "#1E2139" : "#DFE3FA"}
            onMouseLeave={(e) => e.target.style.backgroundColor = isDk(c) ? "#252945" : "#F9FAFE"}>
              Edit
            </button>
            <button onClick={() => setShowDelete(true)} style={{
              padding: "16px 24px", borderRadius: "24px", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: "15px",
              backgroundColor: c.deleteBtn, color: "#FFFFFF", transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = c.deleteBtnHover}
            onMouseLeave={(e) => e.target.style.backgroundColor = c.deleteBtn}>
              Delete
            </button>
            {invoice.status === "pending" && (
              <button onClick={onMarkPaid} style={{
                padding: "16px 24px", borderRadius: "24px", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontWeight: 700, fontSize: "15px",
                backgroundColor: c.purple, color: "#FFFFFF", transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = c.purpleLight}
              onMouseLeave={(e) => e.target.style.backgroundColor = c.purple}>
                Mark as Paid
              </button>
            )}
          </div>
        )}
      </div>

      {/* Invoice Body */}
      <div style={{
        backgroundColor: c.cardBg, borderRadius: "8px", padding: isMobile ? "24px" : "48px",
        boxShadow: "0 10px 10px -10px rgba(72,84,159,0.1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "30px", marginBottom: "21px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: c.textPrimary, letterSpacing: "-0.8px" }}>
              <span style={{ color: c.textMuted }}>#</span>{invoice.id}
            </h2>
            <p style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted, marginTop: "4px" }}>{invoice.description}</p>
          </div>
          <div style={{ textAlign: isMobile ? "left" : "right" }}>
            <p style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted, lineHeight: "18px" }}>
              {invoice.senderAddress.street}<br />
              {invoice.senderAddress.city}<br />
              {invoice.senderAddress.postCode}<br />
              {invoice.senderAddress.country}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: "30px", marginBottom: "40px" }}>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted, marginBottom: "12px" }}>Invoice Date</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: c.textPrimary }}>{formatDate(invoice.createdAt)}</p>
            <p style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted, marginTop: "32px", marginBottom: "12px" }}>Payment Due</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: c.textPrimary }}>{formatDate(invoice.paymentDue)}</p>
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted, marginBottom: "12px" }}>Bill To</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: c.textPrimary, marginBottom: "8px" }}>{invoice.clientName}</p>
            <p style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted, lineHeight: "18px" }}>
              {invoice.clientAddress.street}<br />
              {invoice.clientAddress.city}<br />
              {invoice.clientAddress.postCode}<br />
              {invoice.clientAddress.country}
            </p>
          </div>
          <div style={isMobile ? { gridColumn: "1 / -1" } : {}}>
            <p style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted, marginBottom: "12px" }}>Sent to</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: c.textPrimary }}>{invoice.clientEmail || "N/A"}</p>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ borderRadius: "8px 8px 0 0", backgroundColor: c.invoiceItemBg, padding: isMobile ? "24px" : "32px" }}>
          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "16px", marginBottom: "32px" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted }}>Item Name</span>
              <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted, textAlign: "center", minWidth: "40px" }}>QTY.</span>
              <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted, textAlign: "right", minWidth: "80px" }}>Price</span>
              <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted, textAlign: "right", minWidth: "100px" }}>Total</span>
            </div>
          )}
          {invoice.items.map((item, idx) => (
            isMobile ? (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: idx < invoice.items.length - 1 ? "24px" : 0 }}>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: c.textPrimary, marginBottom: "8px" }}>{item.name}</p>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: c.textMuted }}>
                    {item.quantity} x {formatCurrency(item.price)}
                  </p>
                </div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: c.textPrimary }}>{formatCurrency(item.total)}</p>
              </div>
            ) : (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "16px", marginBottom: idx < invoice.items.length - 1 ? "32px" : 0, alignItems: "center" }}>
                <span style={{ fontSize: "15px", fontWeight: 700, color: c.textPrimary }}>{item.name}</span>
                <span style={{ fontSize: "15px", fontWeight: 700, color: c.textMuted, textAlign: "center", minWidth: "40px" }}>{item.quantity}</span>
                <span style={{ fontSize: "15px", fontWeight: 700, color: c.textMuted, textAlign: "right", minWidth: "80px" }}>{formatCurrency(item.price)}</span>
                <span style={{ fontSize: "15px", fontWeight: 700, color: c.textPrimary, textAlign: "right", minWidth: "100px" }}>{formatCurrency(item.total)}</span>
              </div>
            )
          ))}
        </div>
        <div style={{
          borderRadius: "0 0 8px 8px", backgroundColor: c.invoiceTotalBg, padding: isMobile ? "24px" : "24px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#FFFFFF" }}>Amount Due</span>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
            {formatCurrency(invoice.total)}
          </span>
        </div>
      </div>

      {/* Mobile Bottom Buttons */}
      {isMobile && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          backgroundColor: c.cardBg, padding: "22px 24px",
          display: "flex", justifyContent: "center", gap: "8px",
          boxShadow: "0 -10px 10px -10px rgba(72,84,159,0.1)",
        }}>
          <button onClick={onEdit} style={{
            padding: "16px 24px", borderRadius: "24px", border: "none", cursor: "pointer",
            fontFamily: "inherit", fontWeight: 700, fontSize: "15px",
            backgroundColor: isDk(c) ? "#252945" : "#F9FAFE", color: c.textMuted,
          }}>Edit</button>
          <button onClick={() => setShowDelete(true)} style={{
            padding: "16px 24px", borderRadius: "24px", border: "none", cursor: "pointer",
            fontFamily: "inherit", fontWeight: 700, fontSize: "15px",
            backgroundColor: c.deleteBtn, color: "#FFFFFF",
          }}>Delete</button>
          {invoice.status === "pending" && (
            <button onClick={onMarkPaid} style={{
              padding: "16px 24px", borderRadius: "24px", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: "15px",
              backgroundColor: c.purple, color: "#FFFFFF",
            }}>Mark as Paid</button>
          )}
        </div>
      )}

      {showDelete && (
        <DeleteModal invoiceId={invoice.id} onConfirm={onDelete} onCancel={() => setShowDelete(false)} />
      )}
    </div>
  );
}

// ─── Invoice List Item ───
function InvoiceListItem({ invoice, onClick }) {
  const c = useTheme();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "auto 1fr auto auto auto auto",
        gap: isMobile ? "24px" : "16px",
        alignItems: "center",
        backgroundColor: c.cardBg, borderRadius: "8px",
        padding: isMobile ? "24px" : "16px 24px",
        border: `1px solid ${hovered ? c.purple : "transparent"}`,
        cursor: "pointer", fontFamily: "inherit",
        boxShadow: "0 10px 10px -10px rgba(72,84,159,0.1)",
        transition: "border-color 0.2s",
        textAlign: "left",
      }}
    >
      {isMobile ? (
        <>
          <div>
            <span style={{ fontSize: "15px", fontWeight: 700, color: c.textPrimary, letterSpacing: "-0.25px" }}>
              <span style={{ color: c.textMuted }}>#</span>{invoice.id}
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted }}>{invoice.clientName}</span>
          </div>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted, display: "block", marginBottom: "8px" }}>
              Due {formatDate(invoice.paymentDue)}
            </span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: c.textPrimary, letterSpacing: "-0.25px" }}>
              {formatCurrency(invoice.total)}
            </span>
          </div>
          <div style={{ justifySelf: "end" }}>
            <StatusBadge status={invoice.status} />
          </div>
        </>
      ) : (
        <>
          <span style={{ fontSize: "15px", fontWeight: 700, color: c.textPrimary, letterSpacing: "-0.25px", minWidth: "70px" }}>
            <span style={{ color: c.textMuted }}>#</span>{invoice.id}
          </span>
          <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted, minWidth: "120px" }}>
            Due {formatDate(invoice.paymentDue)}
          </span>
          <span style={{ fontSize: "13px", fontWeight: 500, color: c.textMuted, minWidth: "100px" }}>
            {invoice.clientName}
          </span>
          <span style={{ fontSize: "15px", fontWeight: 700, color: c.textPrimary, letterSpacing: "-0.25px", minWidth: "100px", textAlign: "right" }}>
            {formatCurrency(invoice.total)}
          </span>
          <StatusBadge status={invoice.status} />
          <IconArrowRight />
        </>
      )}
    </button>
  );
}

// ─── Filter Dropdown ───
function FilterDropdown({ filters, setFilters }) {
  const c = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggle = (status) => {
    setFilters(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const statuses = ["draft", "pending", "paid"];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: "14px", background: "none", border: "none",
        cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "15px",
        letterSpacing: "-0.25px", color: c.textPrimary,
      }}>
        <span>{isMobile ? "Filter" : "Filter by status"}</span>
        <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}><IconArrowDown /></span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 23px)", left: "50%", transform: "translateX(-50%)",
          width: "192px", padding: "24px", backgroundColor: c.popupBg, borderRadius: "8px",
          boxShadow: c.popupShadow, zIndex: 20,
        }}>
          {statuses.map(s => (
            <label key={s} style={{
              display: "flex", alignItems: "center", gap: "13px", cursor: "pointer",
              marginBottom: s !== "paid" ? "16px" : 0, fontWeight: 700, fontSize: "15px",
              letterSpacing: "-0.25px", color: c.textPrimary, textTransform: "capitalize",
            }}>
              <span onClick={() => toggle(s)} role="checkbox" aria-checked={filters[s]} tabIndex={0}
                onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(s); } }}
                style={{
                  width: "16px", height: "16px", borderRadius: "2px",
                  backgroundColor: filters[s] ? c.purple : (isDk(c) ? "#1E2139" : "#DFE3FA"),
                  border: filters[s] ? "none" : "1px solid transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  transition: "background-color 0.2s", cursor: "pointer",
                }}>
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

// ─── Sidebar ───
function Sidebar({ theme, toggleTheme, sidebarWidth }) {
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (isDesktop) {
    return (
      <aside style={{
        position: "fixed", left: 0, top: 0, bottom: 0, width: `${sidebarWidth}px`,
        backgroundColor: "#373B53", borderTopRightRadius: "20px", borderBottomRightRadius: "20px",
        display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 100,
        overflow: "hidden",
      }}>
        <div style={{
          width: `${sidebarWidth}px`, height: `${sidebarWidth}px`, backgroundColor: "#7C5DFA",
          borderBottomRightRadius: "20px", position: "relative", overflow: "hidden", cursor: "pointer",
        }}>
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
            backgroundColor: "#9277FF", borderTopLeftRadius: "20px",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: "28px", height: "26px", zIndex: 1,
          }}>
            <svg width="28" height="26" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.513 0C24.965 2.309 28 6.91 28 12.21 28 19.826 21.732 26 14 26S0 19.826 0 12.21C0 6.91 3.035 2.309 7.487 0L14 12.9z" fill="#FFF" fillRule="nonzero"/>
            </svg>
          </div>
        </div>
        <div>
          <button onClick={toggleTheme} aria-label="Toggle theme" style={{
            width: "100%", height: `${sidebarWidth}px`, display: "flex", alignItems: "center",
            justifyContent: "center", background: "none", border: "none", cursor: "pointer",
          }}>
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>
          <div style={{ borderTop: "1px solid #494E6E", padding: "24px 0", display: "flex", justifyContent: "center" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "linear-gradient(135deg, #7C5DFA, #C4A3FF)",
              border: "2px solid #F0F0F0",
            }} />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, height: isMobile ? "72px" : "80px",
      backgroundColor: "#373B53", display: "flex", justifyContent: "space-between",
      alignItems: "center", zIndex: 100,
    }}>
      <div style={{
        width: isMobile ? "72px" : "80px", height: "100%", backgroundColor: "#7C5DFA",
        borderTopRightRadius: "20px", borderBottomRightRadius: "20px",
        position: "relative", overflow: "hidden", cursor: "pointer",
      }}>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
          backgroundColor: "#9277FF", borderTopLeftRadius: "20px",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1,
        }}>
          <svg width="28" height="26" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.513 0C24.965 2.309 28 6.91 28 12.21 28 19.826 21.732 26 14 26S0 19.826 0 12.21C0 6.91 3.035 2.309 7.487 0L14 12.9z" fill="#FFF" fillRule="nonzero"/>
          </svg>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button onClick={toggleTheme} aria-label="Toggle theme" style={{
          width: "80px", height: "100%", display: "flex", alignItems: "center",
          justifyContent: "center", background: "none", border: "none", cursor: "pointer",
        }}>
          {theme === "dark" ? <IconSun /> : <IconMoon />}
        </button>
        <div style={{ borderLeft: "1px solid #494E6E", padding: "0 32px", display: "flex", alignItems: "center" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, #7C5DFA, #C4A3FF)",
            border: "2px solid #F0F0F0",
          }} />
        </div>
      </div>
    </header>
  );
}

// ─── Main App ───
export default function InvoiceApp() {
  const [theme, setTheme] = useState(loadTheme);
  const [invoices, setInvoices] = useState(loadInvoices);
  const [view, setView] = useState("list"); // list, detail, form-new, form-edit
  const [selectedId, setSelectedId] = useState(null);
  const [filters, setFilters] = useState({ draft: false, pending: false, paid: false });
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  const colors = getStyles(theme);
  const isDesktop = windowWidth >= 1024;
  const isMobile = windowWidth < 768;
  const sidebarWidth = isDesktop ? 103 : 0;
  const topOffset = isDesktop ? 0 : isMobile ? 72 : 80;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { saveInvoices(invoices); }, [invoices]);
  useEffect(() => { localStorage.setItem(THEME_KEY, theme); }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const activeFilters = Object.entries(filters).filter(([_, v]) => v).map(([k]) => k);
  const filteredInvoices = activeFilters.length === 0
    ? invoices
    : invoices.filter(inv => activeFilters.includes(inv.status));

  const selectedInvoice = invoices.find(inv => inv.id === selectedId);

  const handleSaveInvoice = (newInvoice) => {
    setInvoices(prev => {
      const idx = prev.findIndex(i => i.id === newInvoice.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = newInvoice; return next; }
      return [newInvoice, ...prev];
    });
    setView("list");
    setSelectedId(null);
  };

  const handleDelete = () => {
    setInvoices(prev => prev.filter(i => i.id !== selectedId));
    setView("list");
    setSelectedId(null);
  };

  const handleMarkPaid = () => {
    setInvoices(prev => prev.map(i => i.id === selectedId ? { ...i, status: "paid" } : i));
  };

  return (
    <ThemeContext.Provider value={colors}>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", backgroundColor: colors.bg, transition: "background-color 0.3s" }}>
        <Sidebar theme={theme} toggleTheme={toggleTheme} sidebarWidth={sidebarWidth} />

        <main style={{
          marginLeft: isDesktop ? `${sidebarWidth}px` : 0,
          paddingTop: `${topOffset + 32}px`,
          paddingBottom: "80px",
          minHeight: "100vh",
        }}>
          {/* LIST VIEW */}
          {view === "list" && (
            <div style={{ maxWidth: "730px", margin: "0 auto", width: "100%", padding: isMobile ? "0 24px" : "0 24px" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "65px" }}>
                <div>
                  <h1 style={{ fontSize: isMobile ? "24px" : "36px", fontWeight: 700, letterSpacing: isMobile ? "-0.75px" : "-1.13px", color: colors.textPrimary, lineHeight: 1.1 }}>
                    Invoices
                  </h1>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: colors.textMuted, marginTop: "8px" }}>
                    {isMobile
                      ? `${filteredInvoices.length} invoices`
                      : filteredInvoices.length === 0
                        ? "No invoices"
                        : `There are ${filteredInvoices.length} total invoices`}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "18px" : "40px" }}>
                  <FilterDropdown filters={filters} setFilters={setFilters} />
                  <button onClick={() => setView("form-new")} style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    padding: "8px 16px 8px 8px", borderRadius: "24px", border: "none",
                    cursor: "pointer", backgroundColor: colors.purple, color: "#FFFFFF",
                    fontFamily: "inherit", fontWeight: 700, fontSize: "15px",
                    letterSpacing: "-0.25px", transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.purpleLight}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.purple}>
                    <span style={{
                      width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#FFFFFF",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <IconPlus />
                    </span>
                    {isMobile ? "New" : "New Invoice"}
                  </button>
                </div>
              </div>

              {/* Invoice List */}
              {filteredInvoices.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "100px", textAlign: "center" }}>
                  <IconEmpty />
                  <h2 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.63px", color: colors.textPrimary, marginTop: "64px" }}>
                    There is nothing here
                  </h2>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: colors.textMuted, marginTop: "24px", maxWidth: "220px", lineHeight: "15px" }}>
                    Create an invoice by clicking the <strong>New Invoice</strong> button and get started
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {filteredInvoices.map(inv => (
                    <InvoiceListItem key={inv.id} invoice={inv} onClick={() => { setSelectedId(inv.id); setView("detail"); }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DETAIL VIEW */}
          {view === "detail" && selectedInvoice && (
            <InvoiceDetail
              invoice={selectedInvoice}
              onBack={() => { setView("list"); setSelectedId(null); }}
              onEdit={() => setView("form-edit")}
              onDelete={handleDelete}
              onMarkPaid={handleMarkPaid}
            />
          )}

          {/* FORM VIEW */}
          {(view === "form-new" || view === "form-edit") && (
            <InvoiceForm
              invoice={view === "form-edit" ? selectedInvoice : null}
              onSave={handleSaveInvoice}
              onCancel={() => setView(selectedId ? "detail" : "list")}
              sidebarWidth={sidebarWidth}
            />
          )}
        </main>
      </div>
    </ThemeContext.Provider>
  );
}
