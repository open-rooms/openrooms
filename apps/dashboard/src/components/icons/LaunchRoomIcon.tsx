export function LaunchRoomIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="22"
        y="26"
        width="52"
        height="44"
        rx="12"
        fill="#FDBA74"
        stroke="#000"
        strokeWidth="2.5"
      />
      <polygon
        points="42,42 60,48 42,54"
        fill="#000"
      />
    </svg>
  )
}
