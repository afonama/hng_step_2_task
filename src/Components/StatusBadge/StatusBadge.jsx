import "./StatusBadge.css";

export default function StatusBadge({ status }) {
  return (
    <div className={`status-badge status-badge--${status}`}>
      <div className="status-badge__dot" />
      <span className="status-badge__label">{status}</span>
    </div>
  );
}
