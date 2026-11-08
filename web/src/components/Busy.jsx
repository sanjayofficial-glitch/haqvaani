/* App loading indicator — small spinner + status text (aria-live).
   Used by API-backed screens so a fetch never looks like a frozen page. */

export default function Busy({ label = "लोड हो रहा है… · loading…" }) {
  return (
    <div className="busy" role="status" aria-live="polite">
      <span className="spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
