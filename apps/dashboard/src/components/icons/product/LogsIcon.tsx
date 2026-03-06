// Logs — terminal window with scrolling output lines
// 96x96, accent #C084FC soft purple, cream interior #F5F1E8

export function LogsIcon({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Terminal window frame */}
      <rect x="8" y="10" width="80" height="76" rx="8" fill="#C084FC" stroke="#4B3A2F" strokeWidth="2.5"/>
      {/* Title bar */}
      <rect x="8" y="10" width="80" height="20" rx="8" fill="#C084FC" stroke="#4B3A2F" strokeWidth="2.5"/>
      {/* Fix bottom of title bar (straight) */}
      <rect x="8" y="22" width="80" height="8" rx="0" fill="#C084FC" stroke="none"/>

      {/* Title bar traffic lights */}
      <circle cx="24" cy="20" r="4" fill="#FF6B6B" stroke="#4B3A2F" strokeWidth="1.5"/>
      <circle cx="36" cy="20" r="4" fill="#FFD93D" stroke="#4B3A2F" strokeWidth="1.5"/>
      <circle cx="48" cy="20" r="4" fill="#6BCB77" stroke="#4B3A2F" strokeWidth="1.5"/>

      {/* Terminal body interior */}
      <rect x="16" y="30" width="64" height="48" rx="3" fill="#1E1B2E" stroke="#4B3A2F" strokeWidth="1.5"/>

      {/* Terminal output lines */}
      {/* Prompt + command line 1 */}
      <circle cx="24" cy="42" r="2" fill="#C084FC"/>
      <rect x="30" y="40" width="20" height="4" rx="1" fill="#C084FC" opacity="0.9"/>
      <rect x="54" y="40" width="14" height="4" rx="1" fill="#F5F1E8" opacity="0.5"/>

      {/* Output line 2 */}
      <rect x="24" y="50" width="36" height="3" rx="1" fill="#F5F1E8" opacity="0.4"/>

      {/* Output line 3 */}
      <rect x="24" y="57" width="28" height="3" rx="1" fill="#F5F1E8" opacity="0.4"/>

      {/* Output line 4 — shorter, muted */}
      <rect x="24" y="64" width="44" height="3" rx="1" fill="#C084FC" opacity="0.5"/>

      {/* Cursor blink */}
      <rect x="24" y="71" width="7" height="4" rx="1" fill="#C084FC"/>

      {/* Scrollbar */}
      <rect x="72" y="34" width="4" height="38" rx="2" fill="#4B3A2F" opacity="0.15"/>
      <rect x="72" y="34" width="4" height="14" rx="2" fill="#C084FC" opacity="0.7"/>
    </svg>
  )
}
