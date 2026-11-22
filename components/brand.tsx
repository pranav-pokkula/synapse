export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="10" fill="currentColor" />
        <path
          d="M9 11L16 7L23 12L16 18L9 23M9 11L16 18L23 24M9 11V23M23 12V24"
          stroke="var(--brand-ink, white)"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="18" r="2.3" fill="var(--brand-ink, white)" />
      </svg>
      {!compact && (
        <span>
          SYNAPSE<span className="brand-dot">.</span>
        </span>
      )}
    </span>
  );
}
