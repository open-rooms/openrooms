export function LogsIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="18" y="22" width="60" height="52" rx="12"
        fill="#FDBA74"
        stroke="#000"
        strokeWidth="2.5"
      />
      <polyline
        points="30,46 38,54 30,62"
        stroke="#000"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="44" y1="62" x2="64" y2="62"
        stroke="#000"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
