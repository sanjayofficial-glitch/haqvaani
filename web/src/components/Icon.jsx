/* The small icon library for the web rebuild.
   These are the Icon components referenced by the screen imports.
   Play / mute / success-X are kept as inline SVG in the screens where
   they carry browser-style cues without a faithful Icon equivalent yet. */

export function Arrow({ size = 14, style, ...rest }) {
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Check({ size = 16, style, ...rest }) {
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export function Eye({ size = 14, style, ...rest }) {
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function File({ size = 14, style, ...rest }) {
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <path d="M6 2 18 7 18 18 6 18 Z" />
      <path d="M6 2 4 4 4 18 6 18" />
    </svg>
  );
}

export function Mic({ size = 14, style, ...rest }) {
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10a7 7 0 0 1-14 0" />
    </svg>
  );
}

export function Phone({ size = 14, style, ...rest }) {
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <path d="M2 15h2a2 2 0 0 0 2-2m-6 6a6 6 0 0 1-6-6v-1a6 6 0 0 1 12 0v1a6 6 0 0 1-6 6Z" />
    </svg>
  );
}

export function Stamp({ tone = "accent", size = 14, style, ...rest }) {
  return (
    <svg
      className="ic stamp-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke={tone === "success" ? "var(--success)" : "var(--accent)"}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export function StampVintage({ size = 14, style, ...rest }) {
  return (
    <svg
      className="ic stamp-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <circle cx="12" cy="12" r="9" strokeDasharray="3 4" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function Trash({ size = 14, style, ...rest }) {
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

export function Warning({ size = 14, style, ...rest }) {
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 12 3l1.7-.9A8 8 0 1 1 9.3 18.1" />
    </svg>
  );
}

export function Lock({ size = 14, style, ...rest }) {
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function Clock({ size = 14, style, ...rest }) {
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
