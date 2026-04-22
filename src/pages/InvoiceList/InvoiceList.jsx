import useWindowWidth from "../../hooks/useWindowWidth";
import FilterDropdown from "../../components/FilterDropdown/FilterDropdown";
import { IconPlus, IconEmpty } from "../../components/Icons";
import InvoiceListItem from "./InvoiceListItem";
import "./InvoiceList.css";

export default function InvoiceList({
  invoices,
  filters,
  setFilters,
  onNewInvoice,
  onSelectInvoice,
}) {
  const { isMobile } = useWindowWidth();

  const activeFilters = Object.entries(filters)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const filtered =
    activeFilters.length === 0
      ? invoices
      : invoices.filter((inv) => activeFilters.includes(inv.status));

  const countLabel = isMobile
    ? `${filtered.length} invoices`
    : filtered.length === 0
      ? "No invoices"
      : `There are ${filtered.length} total invoices`;

  return (
    <div className="invoice-list">
      {/* ── Header ── */}
      <div className="invoice-list__header">
        <div>
          <h1
            className={`invoice-list__title ${isMobile ? "invoice-list__title--mobile" : ""}`}
          >
            Invoices
          </h1>
          <p className="invoice-list__subtitle">{countLabel}</p>
        </div>

        <div
          className={`invoice-list__controls ${isMobile ? "invoice-list__controls--mobile" : ""}`}
        >
          <FilterDropdown filters={filters} setFilters={setFilters} />

          <button className="invoice-list__new-btn" onClick={onNewInvoice}>
            <span className="invoice-list__new-btn-icon">
              <IconPlus />
            </span>
            {isMobile ? "New" : "New Invoice"}
          </button>
        </div>
      </div>

      {/* ── List or empty ── */}
      {filtered.length === 0 ? (
        <div className="invoice-list__empty">
          <IconEmpty />
          <h2 className="invoice-list__empty-title">There is nothing here</h2>
          <p className="invoice-list__empty-text">
            Create an invoice by clicking the{" "}
            <strong>New Invoice</strong> button and get started
          </p>
        </div>
      ) : (
        <div className="invoice-list__items">
          {filtered.map((inv) => (
            <InvoiceListItem
              key={inv.id}
              invoice={inv}
              onClick={() => onSelectInvoice(inv.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
