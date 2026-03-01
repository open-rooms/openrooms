export function AgentIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="26" y="28" width="44" height="40" rx="14"
        fill="#5EEAD4"
        stroke="#000"
        strokeWidth="2.5"
      />
      <circle cx="40" cy="46" r="4" fill="#000" />
      <circle cx="56" cy="46" r="4" fill="#000" />
      <rect x="42" y="18" width="12" height="10" rx="5" fill="#000" />
      <line x1="48" y1="14" x2="48" y2="18"
        stroke="#000"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
