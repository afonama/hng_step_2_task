import { useState, useEffect, useRef } from "react";
import useWindowWidth from "../../hooks/useWindowWidth";
import FormField from "../../components/FormField/FormField";
import SelectField from "../../components/SelectField/SelectField";
import { IconDelete } from "../../components/Icons";
import { generateId, addDays } from "../../utils/helpers";
import { PAYMENT_TERMS_OPTIONS } from "../../utils/constants";
import "./InvoiceForm.css";

const EMPTY_ITEM = { name: "", quantity: "", price: "", total: 0 };

function buildDefault() {
  return {
    senderStreet: "",
    senderCity: "",
    senderPostCode: "",
    senderCountry: "",
    clientName: "",
    clientEmail: "",
    clientStreet: "",
    clientCity: "",
    clientPostCode: "",
    clientCountry: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    paymentTerms: 30,
    description: "",
    items: [{ ...EMPTY_ITEM }],
  };
}

function buildFromInvoice(inv) {
  return {
    senderStreet: inv.senderAddress.street,
    senderCity: inv.senderAddress.city,
    senderPostCode: inv.senderAddress.postCode,
    senderCountry: inv.senderAddress.country,
    clientName: inv.clientName,
    clientEmail: inv.clientEmail,
    clientStreet: inv.clientAddress.street,
    clientCity: inv.clientAddress.city,
    clientPostCode: inv.clientAddress.postCode,
    clientCountry: inv.clientAddress.country,
    invoiceDate: inv.createdAt,
    paymentTerms: inv.paymentTerms,
    description: inv.description,
    items: inv.items.map((it) => ({
      name: it.name,
      quantity: String(it.quantity),
      price: String(it.price),
      total: it.total,
    })),
  };
}

export default function InvoiceForm({ invoice, onSave, onCancel }) {
  const { isMobile, isDesktop } = useWindowWidth();
  const formRef = useRef(null);
  const isEdit = !!invoice;

  const [form, setForm] = useState(() =>
    invoice ? buildFromInvoice(invoice) : buildDefault()
  );
  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const setItem = (idx, field, val) => {
    setForm((p) => {
      const items = [...p.items];
      items[idx] = { ...items[idx], [field]: val };
      if (field === "quantity" || field === "price") {
        const q = parseFloat(items[idx].quantity) || 0;
        const pr = parseFloat(items[idx].price) || 0;
        items[idx].total = q * pr;
      }
      return { ...p, items };
    });
  };

  const addItem = () =>
    setForm((p) => ({ ...p, items: [...p.items, { ...EMPTY_ITEM }] }));

  const removeItem = (idx) =>
    setForm((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  /* ── Validation ── */
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
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail))
        e.clientEmail = "invalid email";
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
        if (!item.quantity || parseFloat(item.quantity) <= 0)
          itemE.quantity = "invalid";
        if (!item.price || parseFloat(item.price) <= 0) itemE.price = "invalid";
        if (Object.keys(itemE).length) ie[idx] = itemE;
      });
    }
    setErrors(e);
    setItemErrors(ie);
    return Object.keys(e).length === 0 && Object.keys(ie).length === 0;
  };

  /* ── Build invoice object ── */
  const buildInvoice = (status) => ({
    id: invoice?.id || generateId(),
    createdAt: form.invoiceDate,
    paymentDue: addDays(form.invoiceDate, form.paymentTerms),
    description: form.description,
    paymentTerms: form.paymentTerms,
    clientName: form.clientName,
    clientEmail: form.clientEmail,
    status,
    senderAddress: {
      street: form.senderStreet,
      city: form.senderCity,
      postCode: form.senderPostCode,
      country: form.senderCountry,
    },
    clientAddress: {
      street: form.clientStreet,
      city: form.clientCity,
      postCode: form.clientPostCode,
      country: form.clientCountry,
    },
    items: form.items.map((it) => ({
      name: it.name,
      quantity: parseFloat(it.quantity) || 0,
      price: parseFloat(it.price) || 0,
      total: (parseFloat(it.quantity) || 0) * (parseFloat(it.price) || 0),
    })),
    total: form.items.reduce(
      (sum, it) =>
        sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.price) || 0),
      0
    ),
  });

  const handleSave = (asDraft = false) => {
    setAttemptedSubmit(true);
    if (!asDraft && !validate(false)) return;
    onSave(
      buildInvoice(asDraft ? "draft" : isEdit ? invoice.status : "pending")
    );
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  /* ── Responsive grid helper ── */
  const colClass = isMobile ? "form-panel__row--2col" : "form-panel__row--3col";

  return (
    <>
      <div className="form-overlay" onClick={onCancel} />

      <div
        ref={formRef}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit Invoice" : "New Invoice"}
        className={`form-panel ${isMobile ? "form-panel--mobile" : "form-panel--desktop"}`}
      >
        <h2 className="form-panel__title">
          {isEdit ? (
            <>
              Edit <span className="form-panel__title-hash">#</span>
              {invoice.id}
            </>
          ) : (
            "New Invoice"
          )}
        </h2>

        {/* ═══ Bill From ═══ */}
        <p className="form-panel__section">Bill From</p>
        <FormField
          label="Street Address"
          id="sender-street"
          value={form.senderStreet}
          onChange={(e) => set("senderStreet", e.target.value)}
          error={errors.senderStreet}
        />
        <div className={`form-panel__row ${colClass}`}>
          <FormField
            label="City"
            id="sender-city"
            value={form.senderCity}
            onChange={(e) => set("senderCity", e.target.value)}
            error={errors.senderCity}
          />
          <FormField
            label="Post Code"
            id="sender-postcode"
            value={form.senderPostCode}
            onChange={(e) => set("senderPostCode", e.target.value)}
            error={errors.senderPostCode}
          />
          {!isMobile && (
            <FormField
              label="Country"
              id="sender-country"
              value={form.senderCountry}
              onChange={(e) => set("senderCountry", e.target.value)}
              error={errors.senderCountry}
            />
          )}
        </div>
        {isMobile && (
          <div className="form-panel__row form-panel__row--1col">
            <FormField
              label="Country"
              id="sender-country"
              value={form.senderCountry}
              onChange={(e) => set("senderCountry", e.target.value)}
              error={errors.senderCountry}
            />
          </div>
        )}

        {/* ═══ Bill To ═══ */}
        <p className="form-panel__section form-panel__section--bill-to">
          Bill To
        </p>
        <FormField
          label="Client's Name"
          id="client-name"
          value={form.clientName}
          onChange={(e) => set("clientName", e.target.value)}
          error={errors.clientName}
        />
        <div className="form-panel__row form-panel__row--1col">
          <FormField
            label="Client's Email"
            id="client-email"
            value={form.clientEmail}
            onChange={(e) => set("clientEmail", e.target.value)}
            error={errors.clientEmail}
            placeholder="e.g. email@example.com"
          />
        </div>
        <div className="form-panel__row form-panel__row--1col">
          <FormField
            label="Street Address"
            id="client-street"
            value={form.clientStreet}
            onChange={(e) => set("clientStreet", e.target.value)}
            error={errors.clientStreet}
          />
        </div>
        <div className={`form-panel__row ${colClass}`}>
          <FormField
            label="City"
            id="client-city"
            value={form.clientCity}
            onChange={(e) => set("clientCity", e.target.value)}
            error={errors.clientCity}
          />
          <FormField
            label="Post Code"
            id="client-postcode"
            value={form.clientPostCode}
            onChange={(e) => set("clientPostCode", e.target.value)}
            error={errors.clientPostCode}
          />
          {!isMobile && (
            <FormField
              label="Country"
              id="client-country"
              value={form.clientCountry}
              onChange={(e) => set("clientCountry", e.target.value)}
              error={errors.clientCountry}
            />
          )}
        </div>
        {isMobile && (
          <div className="form-panel__row form-panel__row--1col">
            <FormField
              label="Country"
              id="client-country"
              value={form.clientCountry}
              onChange={(e) => set("clientCountry", e.target.value)}
              error={errors.clientCountry}
            />
          </div>
        )}

        {/* ═══ Invoice details ═══ */}
        <div
          className={`form-panel__row form-panel__row--details ${isMobile ? "form-panel__row--1col" : "form-panel__row--2col"}`}
        >
          <div className={isEdit ? "form-panel__field--disabled" : ""}>
            <FormField
              label="Invoice Date"
              id="invoice-date"
              type="date"
              value={form.invoiceDate}
              onChange={(e) => set("invoiceDate", e.target.value)}
              error={errors.invoiceDate}
              disabled={isEdit}
            />
          </div>
          <SelectField
            label="Payment Terms"
            id="payment-terms"
            value={form.paymentTerms}
            onChange={(v) => set("paymentTerms", v)}
            options={PAYMENT_TERMS_OPTIONS}
          />
        </div>
        <div className="form-panel__row form-panel__row--1col">
          <FormField
            label="Project Description"
            id="description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            error={errors.description}
            placeholder="e.g. Graphic Design Service"
          />
        </div>

        {/* ═══ Item List ═══ */}
        <h3 className="form-panel__items-title">Item List</h3>

        {!isMobile && form.items.length > 0 && (
          <div className="form-panel__items-header">
            <span className="form-panel__items-header-cell">Item Name</span>
            <span className="form-panel__items-header-cell">Qty.</span>
            <span className="form-panel__items-header-cell">Price</span>
            <span className="form-panel__items-header-cell">Total</span>
            <span />
          </div>
        )}

        {form.items.map((item, idx) => (
          <div
            key={idx}
            className={`form-panel__item-row ${isMobile ? "form-panel__item-row--mobile" : "form-panel__item-row--desktop"}`}
          >
            {isMobile ? (
              <>
                <FormField
                  label="Item Name"
                  id={`item-name-${idx}`}
                  value={item.name}
                  onChange={(e) => setItem(idx, "name", e.target.value)}
                  error={itemErrors[idx]?.name}
                />
                <div className="form-panel__item-fields-mobile">
                  <FormField
                    label="Qty."
                    id={`item-qty-${idx}`}
                    type="number"
                    value={item.quantity}
                    onChange={(e) => setItem(idx, "quantity", e.target.value)}
                    error={itemErrors[idx]?.quantity}
                  />
                  <FormField
                    label="Price"
                    id={`item-price-${idx}`}
                    type="number"
                    value={item.price}
                    onChange={(e) => setItem(idx, "price", e.target.value)}
                    error={itemErrors[idx]?.price}
                  />
                  <div className="form-panel__item-total-wrap">
                    <span className="form-panel__item-total-label">Total</span>
                    <span className="form-panel__item-total">
                      {(item.total || 0).toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="form-panel__item-delete form-panel__item-delete--offset"
                    onClick={() => removeItem(idx)}
                    aria-label="Delete item"
                  >
                    <IconDelete />
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  value={item.name}
                  onChange={(e) => setItem(idx, "name", e.target.value)}
                  className={`form-panel__item-input ${itemErrors[idx]?.name ? "form-panel__item-input--error" : ""}`}
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => setItem(idx, "quantity", e.target.value)}
                  className={`form-panel__item-input form-panel__item-input--qty ${itemErrors[idx]?.quantity ? "form-panel__item-input--error" : ""}`}
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => setItem(idx, "price", e.target.value)}
                  className={`form-panel__item-input form-panel__item-input--price ${itemErrors[idx]?.price ? "form-panel__item-input--error" : ""}`}
                />
                <span className="form-panel__item-total">
                  {(item.total || 0).toFixed(2)}
                </span>
                <button
                  type="button"
                  className="form-panel__item-delete"
                  onClick={() => removeItem(idx)}
                  aria-label="Delete item"
                >
                  <IconDelete />
                </button>
              </>
            )}
          </div>
        ))}

        <button type="button" className="form-panel__add-item" onClick={addItem}>
          + Add New Item
        </button>

        {/* Error summary */}
        {attemptedSubmit &&
          (Object.keys(errors).length > 0 ||
            Object.keys(itemErrors).length > 0) && (
            <div className="form-panel__errors">
              <p className="form-panel__error-line">
                - All fields must be added
              </p>
              {errors.items && (
                <p className="form-panel__error-line">
                  - An item must be added
                </p>
              )}
            </div>
          )}

        {/* ═══ Bottom action bar ═══ */}
        <div
          className={`form-panel__actions ${isMobile ? "form-panel__actions--mobile" : "form-panel__actions--desktop"} ${isEdit ? "form-panel__actions--edit" : "form-panel__actions--new"}`}
        >
          {!isEdit && (
            <button
              type="button"
              className="form-btn--discard"
              onClick={onCancel}
            >
              Discard
            </button>
          )}
          <div className="form-panel__actions-group">
            {isEdit && (
              <button
                type="button"
                className="form-btn--discard"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
            {!isEdit && (
              <button
                type="button"
                className="form-btn--draft"
                onClick={() => handleSave(true)}
              >
                Save as Draft
              </button>
            )}
            <button
              type="button"
              className="form-btn--save"
              onClick={() => handleSave(false)}
            >
              {isEdit ? "Save Changes" : "Save & Send"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
