export function MemoryIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="24" y="28" width="48" height="40" rx="8"
        fill="#93C5FD"
        stroke="#000"
        strokeWidth="2.5"
      />
      <line x1="24" y1="38" x2="72" y2="38"
        stroke="#000"
        strokeWidth="2.5"
      />
      <line x1="24" y1="48" x2="72" y2="48"
        stroke="#000"
        strokeWidth="2.5"
      />
      <line x1="24" y1="58" x2="72" y2="58"
        stroke="#000"
        strokeWidth="2.5"
      />
    </svg>
  )
}
