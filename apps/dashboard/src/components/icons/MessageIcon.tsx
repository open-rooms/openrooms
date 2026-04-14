// Message / Envelope — 96x96, thick stroke, pastel mint fill
export function MessageIcon({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Envelope body */}
      <rect x="12" y="24" width="72" height="48" rx="8" fill="#6EE7B7" stroke="#111" strokeWidth="2.5"/>
      {/* Envelope flap (V shape) */}
      <polyline points="12,24 48,54 84,24" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Bottom-left fold line */}
      <line x1="12" y1="72" x2="34" y2="50" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
      {/* Bottom-right fold line */}
      <line x1="84" y1="72" x2="62" y2="50" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
      {/* Notification dot */}
      <circle cx="72" cy="26" r="10" fill="#FB923C" stroke="#111" strokeWidth="2.5"/>
      <rect x="70.5" y="21" width="3" height="7" rx="1.5" fill="#111"/>
      <circle cx="72" cy="30" r="1.5" fill="#111"/>
    </svg>
  )
}
