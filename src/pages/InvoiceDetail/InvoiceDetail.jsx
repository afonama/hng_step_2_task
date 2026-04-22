import { useState } from "react";
import useWindowWidth from "../../hooks/useWindowWidth";
import StatusBadge from "../../Components/StatusBadge/StatusBadge";
import DeleteModal from "../../Components/DeleteModal/DeleteModal";
import { IconArrowLeft } from "../../Components/Icons";
import { formatDate, formatCurrency } from "../../utils/helpers";
import "./InvoiceDetail.css";

export default function InvoiceDetail({
  invoice,
  onBack,
  onEdit,
  onDelete,
  onMarkPaid,
}) {
  const { isMobile } = useWindowWidth();
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="detail">
      {/* ── Go back ── */}
      <button className="detail__back" onClick={onBack}>
        <IconArrowLeft /> Go back
      </button>

      {/* ── Status bar ── */}
      <div
        className={`detail__status-bar ${isMobile ? "detail__status-bar--mobile" : ""}`}
      >
        <span className="detail__status-label">Status</span>
        <StatusBadge status={invoice.status} />

        {!isMobile && (
          <div className="detail__status-actions">
            <button className="detail__btn-edit" onClick={onEdit}>
              Edit
            </button>
            <button
              className="detail__btn-delete"
              onClick={() => setShowDelete(true)}
            >
              Delete
            </button>
            {invoice.status === "pending" && (
              <button className="detail__btn-paid" onClick={onMarkPaid}>
                Mark as Paid
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Card ── */}
      <div className={`detail__card ${isMobile ? "detail__card--mobile" : ""}`}>
        {/* Top row */}
        <div className="detail__top">
          <div>
            <h2 className="detail__invoice-id">
              <span className="detail__invoice-hash">#</span>
              {invoice.id}
            </h2>
            <p className="detail__description">{invoice.description}</p>
          </div>
          <div
            className={`detail__sender-address ${!isMobile ? "detail__sender-address--right" : ""}`}
          >
            <p>
              {invoice.senderAddress.street}
              <br />
              {invoice.senderAddress.city}
              <br />
              {invoice.senderAddress.postCode}
              <br />
              {invoice.senderAddress.country}
            </p>
          </div>
        </div>

        {/* Info grid */}
        <div
          className={`detail__info ${isMobile ? "detail__info--mobile" : ""}`}
        >
          <div>
            <p className="detail__info-label">Invoice Date</p>
            <p className="detail__info-value">
              {formatDate(invoice.createdAt)}
            </p>
            <div className="detail__info-gap">
              <p className="detail__info-label">Payment Due</p>
              <p className="detail__info-value">
                {formatDate(invoice.paymentDue)}
              </p>
            </div>
          </div>
          <div>
            <p className="detail__info-label">Bill To</p>
            <p className="detail__info-value">{invoice.clientName}</p>
            <p className="detail__info-address">
              {invoice.clientAddress.street}
              <br />
              {invoice.clientAddress.city}
              <br />
              {invoice.clientAddress.postCode}
              <br />
              {invoice.clientAddress.country}
            </p>
          </div>
          <div className={isMobile ? "detail__info-span" : ""}>
            <p className="detail__info-label">Sent to</p>
            <p className="detail__info-value">
              {invoice.clientEmail || "N/A"}
            </p>
          </div>
        </div>

        {/* Items table */}
        <div
          className={`detail__items ${isMobile ? "detail__items--mobile" : ""}`}
        >
          {!isMobile && (
            <div className="detail__items-header">
              <span className="detail__items-header-cell">Item Name</span>
              <span className="detail__items-header-cell detail__items-header-cell--center">
                QTY.
              </span>
              <span className="detail__items-header-cell detail__items-header-cell--right">
                Price
              </span>
              <span className="detail__items-header-cell detail__items-header-cell--right-lg">
                Total
              </span>
            </div>
          )}

          {invoice.items.map((item, idx) =>
            isMobile ? (
              <div key={idx} className="detail__item-row-mobile">
                <div>
                  <p className="detail__item-mobile-name">{item.name}</p>
                  <p className="detail__item-mobile-meta">
                    {item.quantity} x {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="detail__item-mobile-total">
                  {formatCurrency(item.total)}
                </p>
              </div>
            ) : (
              <div key={idx} className="detail__item-row">
                <span className="detail__item-name">{item.name}</span>
                <span className="detail__item-qty">{item.quantity}</span>
                <span className="detail__item-price">
                  {formatCurrency(item.price)}
                </span>
                <span className="detail__item-total">
                  {formatCurrency(item.total)}
                </span>
              </div>
            )
          )}
        </div>

        {/* Grand total */}
        <div
          className={`detail__total ${isMobile ? "detail__total--mobile" : ""}`}
        >
          <span className="detail__total-label">Amount Due</span>
          <span className="detail__total-amount">
            {formatCurrency(invoice.total)}
          </span>
        </div>
      </div>

      {/* ── Mobile bottom actions ── */}
      {isMobile && (
        <div className="detail__mobile-actions">
          <button className="detail__btn-edit" onClick={onEdit}>
            Edit
          </button>
          <button
            className="detail__btn-delete"
            onClick={() => setShowDelete(true)}
          >
            Delete
          </button>
          {invoice.status === "pending" && (
            <button className="detail__btn-paid" onClick={onMarkPaid}>
              Mark as Paid
            </button>
          )}
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {showDelete && (
        <DeleteModal
          invoiceId={invoice.id}
          onConfirm={onDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
