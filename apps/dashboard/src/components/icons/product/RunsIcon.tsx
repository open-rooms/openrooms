// Runs — machine console with play button
// 96x96, accent #F97316 rust orange, cream interior #F5F1E8

export function RunsIcon({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Machine console outer body */}
      <rect x="8" y="14" width="80" height="60" rx="8" fill="#F97316" stroke="#4B3A2F" strokeWidth="2.5"/>
      {/* Screen recess */}
      <rect x="16" y="22" width="56" height="40" rx="5" fill="#F5F1E8" stroke="#4B3A2F" strokeWidth="2"/>
      {/* Right panel (controls) */}
      <rect x="74" y="22" width="6" height="40" rx="3" fill="#F97316" stroke="#4B3A2F" strokeWidth="1.5"/>

      {/* Status lights — right side panel */}
      <circle cx="77" cy="30" r="2.5" fill="#4ADE80" stroke="#4B3A2F" strokeWidth="1.2"/>
      <circle cx="77" cy="39" r="2.5" fill="#FCD34D" stroke="#4B3A2F" strokeWidth="1.2"/>
      <circle cx="77" cy="48" r="2.5" fill="#F5F1E8" stroke="#4B3A2F" strokeWidth="1.2"/>

      {/* Bottom strip */}
      <rect x="8" y="62" width="80" height="12" rx="0" fill="#F97316" stroke="none"/>
      <rect x="8" y="62" width="80" height="12" rx="8" fill="#F97316" stroke="#4B3A2F" strokeWidth="2.5"/>

      {/* Bottom vents */}
      <line x1="20" y1="68" x2="36" y2="68" stroke="#4B3A2F" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="20" y1="72" x2="36" y2="72" stroke="#4B3A2F" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Play button — centered on screen */}
      <circle cx="44" cy="42" r="14" fill="#F97316" stroke="#4B3A2F" strokeWidth="2.5"/>
      {/* Play triangle */}
      <path d="M40 35 L40 49 L54 42 Z" fill="#F5F1E8" stroke="#4B3A2F" strokeWidth="2" strokeLinejoin="round"/>

      {/* Progress bar below play button */}
      <rect x="22" y="56" width="42" height="3" rx="1.5" fill="#4B3A2F" opacity="0.15"/>
      <rect x="22" y="56" width="24" height="3" rx="1.5" fill="#F97316" stroke="#4B3A2F" strokeWidth="1"/>
    </svg>
  )
}
