export default function SafetyStatusPill({ status }) {
  const s = (status || "").toLowerCase();
  const cls = s.includes("safe") ? "status-safe" : s.includes("high") || s.includes("risk") ? "status-risk" : "status-moderate";
  const dot = s.includes("safe") ? "🟢" : s.includes("high") || s.includes("risk") ? "🔴" : s.includes("caution") ? "🟠" : "🟡";
  return (
    <span className={`status-pill ${cls}`}>
      <span aria-hidden="true">{dot}</span> {status}
    </span>
  );
}
