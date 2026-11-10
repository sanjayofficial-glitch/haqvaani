/* Studio v2 icon library — one consistent 24px grid, stroke 1.9, round
   caps, currentColor. Replaces the thin/mixed-weight set from v1. */

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function base(size, style, rest) {
  return {
    className: "ic",
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    style,
    "aria-hidden": "true",
    ...S,
    ...rest,
  };
}

export function Arrow({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Check({ size = 16, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export function Eye({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function File({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

export function Mic({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
    </svg>
  );
}

export function Phone({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9Z" />
    </svg>
  );
}

export function Stamp({ tone = "accent", size = 14, style, ...rest }) {
  return (
    <svg {...base(size, { ...style, stroke: tone === "success" ? "var(--success)" : "var(--accent)" }, rest)}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export function StampVintage({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, { ...style, stroke: "var(--accent)" }, rest)}>
      <circle cx="12" cy="12" r="9" strokeDasharray="3 4" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function Trash({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
    </svg>
  );
}

export function Warning({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <path d="M10.3 3.9 12 3l1.7-.9A8 8 0 1 1 9.3 18.1" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

export function Lock({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function Clock({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

/* ---------------------------------------------------------------- studio set */

export function Play({ size = 16, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <path d="M7 4.5v15l13-7.5Z" />
    </svg>
  );
}

export function Pause({ size = 16, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

export function Stop({ size = 16, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </svg>
  );
}

export function RecDot({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <circle cx="12" cy="12" r="7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Gallery({ size = 16, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M3 17l5-4 4 3 4-5 5 6" />
    </svg>
  );
}

export function Video({ size = 16, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <rect x="2" y="6" width="13" height="12" rx="2" />
      <path d="M15 10l7-3.5v11L15 14" />
    </svg>
  );
}

export function Upload({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
    </svg>
  );
}

export function Download({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
    </svg>
  );
}

export function Shield({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function Spark({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8Z" />
    </svg>
  );
}

export function Radio({ size = 14, style, ...rest }) {
  return (
    <svg {...base(size, style, rest)}>
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
