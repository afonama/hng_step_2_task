import { useEffect, useRef } from "react";
import "./DeleteModal.css";

export default function DeleteModal({ invoiceId, onConfirm, onCancel }) {
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
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      className="delete-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
      onClick={onCancel}
    >
      <div
        className="delete-modal__box"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-title" className="delete-modal__title">
          Confirm Deletion
        </h2>
        <p className="delete-modal__text">
          Are you sure you want to delete invoice #{invoiceId}? This action
          cannot be undone.
        </p>
        <div className="delete-modal__actions">
          <button
            ref={cancelRef}
            className="delete-modal__cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button className="delete-modal__confirm-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
