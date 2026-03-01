export function RoomsIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="14" y="22" width="68" height="52" rx="12"
        fill="#A78BFA"
        stroke="#000"
        strokeWidth="2.5"
      />
      <rect x="22" y="30" width="52" height="36" rx="6"
        fill="#F5F1E8"
        stroke="#000"
        strokeWidth="2.5"
      />
      <circle cx="28" cy="26" r="3" fill="#000" />
      <circle cx="36" cy="26" r="3" fill="#000" />
      <circle cx="44" cy="26" r="3" fill="#000" />
    </svg>
  )
}
