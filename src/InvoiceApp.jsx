import { useState, useEffect } from "react";
import useWindowWidth from "./hooks/useWindowWidth";
import Sidebar from "./Components/Sidebar/Sidebar";
import InvoiceList from "./pages/InvoiceList/InvoiceList";
import InvoiceDetail from "./pages/InvoiceDetail/InvoiceDetail";
import InvoiceForm from "./pages/InvoiceForm/InvoiceForm";
import { STORAGE_KEY, SAMPLE_INVOICES } from "./utils/constants";
import "./InvoiceApp.css";

function loadInvoices() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && stored.length > 0) return stored;
  } catch {
    /* empty */
  }
  return SAMPLE_INVOICES;
}

function saveInvoices(invoices) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export default function InvoiceApp() {
  const [invoices, setInvoices] = useState(loadInvoices);
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [filters, setFilters] = useState({
    draft: false,
    pending: false,
    paid: false,
  });

  const { isMobile, isDesktop } = useWindowWidth();

  useEffect(() => {
    saveInvoices(invoices);
  }, [invoices]);

  const selectedInvoice = invoices.find((inv) => inv.id === selectedId);

  /* ── CRUD handlers ── */
  const handleSaveInvoice = (newInvoice) => {
    setInvoices((prev) => {
      const idx = prev.findIndex((i) => i.id === newInvoice.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newInvoice;
        return next;
      }
      return [newInvoice, ...prev];
    });
    setView("list");
    setSelectedId(null);
  };

  const handleDelete = () => {
    setInvoices((prev) => prev.filter((i) => i.id !== selectedId));
    setView("list");
    setSelectedId(null);
  };

  const handleMarkPaid = () => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === selectedId ? { ...i, status: "paid" } : i))
    );
  };

  /* ── Layout class ── */
  const mainClass = isDesktop
    ? "app__main--desktop"
    : isMobile
      ? "app__main--mobile"
      : "app__main--tablet";

  return (
    <div className="app">
      <Sidebar />

      <main className={`app__main ${mainClass}`}>
        {view === "list" && (
          <InvoiceList
            invoices={invoices}
            filters={filters}
            setFilters={setFilters}
            onNewInvoice={() => setView("form-new")}
            onSelectInvoice={(id) => {
              setSelectedId(id);
              setView("detail");
            }}
          />
        )}

        {view === "detail" && selectedInvoice && (
          <InvoiceDetail
            invoice={selectedInvoice}
            onBack={() => {
              setView("list");
              setSelectedId(null);
            }}
            onEdit={() => setView("form-edit")}
            onDelete={handleDelete}
            onMarkPaid={handleMarkPaid}
          />
        )}

        {(view === "form-new" || view === "form-edit") && (
          <InvoiceForm
            invoice={view === "form-edit" ? selectedInvoice : null}
            onSave={handleSaveInvoice}
            onCancel={() => setView(selectedId ? "detail" : "list")}
          />
        )}
      </main>
    </div>
  );
}
