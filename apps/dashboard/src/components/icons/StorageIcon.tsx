// Storage / Database — stacked cylinders — 96x96, thick stroke, sky blue fill
export function StorageIcon({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bottom cylinder */}
      <ellipse cx="48" cy="70" rx="28" ry="10" fill="#93C5FD" stroke="#111" strokeWidth="2.5"/>
      <rect x="20" y="56" width="56" height="14" fill="#93C5FD" stroke="#111" strokeWidth="2.5"/>
      <ellipse cx="48" cy="56" rx="28" ry="10" fill="#BFDBFE" stroke="#111" strokeWidth="2.5"/>
      {/* Middle cylinder */}
      <rect x="20" y="38" width="56" height="14" fill="#BFDBFE" stroke="#111" strokeWidth="2.5"/>
      <ellipse cx="48" cy="38" rx="28" ry="10" fill="#E0F2FE" stroke="#111" strokeWidth="2.5"/>
      {/* Top cylinder */}
      <rect x="20" y="20" width="56" height="14" fill="#E0F2FE" stroke="#111" strokeWidth="2.5"/>
      <ellipse cx="48" cy="20" rx="28" ry="10" fill="#F0F9FF" stroke="#111" strokeWidth="2.5"/>
      {/* Highlight lines */}
      <line x1="30" y1="26" x2="42" y2="26" stroke="#111" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <line x1="30" y1="44" x2="42" y2="44" stroke="#111" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <line x1="30" y1="62" x2="42" y2="62" stroke="#111" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )
}
