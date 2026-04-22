import useWindowWidth from "../../hooks/useWindowWidth";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { IconArrowRight } from "../../components/Icons";
import { formatDate, formatCurrency } from "../../utils/helpers";
import "./InvoiceListItem.css";

export default function InvoiceListItem({ invoice, onClick }) {
  const { isMobile } = useWindowWidth();

  if (isMobile) {
    return (
      <button className="invoice-item invoice-item--mobile" onClick={onClick}>
        <div>
          <span className="invoice-item__id">
            <span className="invoice-item__hash">#</span>
            {invoice.id}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="invoice-item__client">{invoice.clientName}</span>
        </div>
        <div>
          <span className="invoice-item__due invoice-item__due--block">
            Due {formatDate(invoice.paymentDue)}
          </span>
          <span className="invoice-item__total" style={{ textAlign: "left" }}>
            {formatCurrency(invoice.total)}
          </span>
        </div>
        <div className="invoice-item__badge--end">
          <StatusBadge status={invoice.status} />
        </div>
      </button>
    );
  }

  return (
    <button className="invoice-item invoice-item--desktop" onClick={onClick}>
      <span className="invoice-item__id">
        <span className="invoice-item__hash">#</span>
        {invoice.id}
      </span>
      <span className="invoice-item__due">
        Due {formatDate(invoice.paymentDue)}
      </span>
      <span className="invoice-item__client">{invoice.clientName}</span>
      <span className="invoice-item__total">
        {formatCurrency(invoice.total)}
      </span>
      <StatusBadge status={invoice.status} />
      <IconArrowRight />
    </button>
  );
}
