// Tools — toolbox with tools inside (wrench + screwdriver peeking out)
// 96x96, accent #5EEAD4 teal, cream interior #F5F1E8

export function ToolsIcon({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Toolbox body */}
      <rect x="10" y="40" width="76" height="44" rx="7" fill="#5EEAD4" stroke="#4B3A2F" strokeWidth="2.5"/>

      {/* Toolbox lid */}
      <rect x="10" y="28" width="76" height="18" rx="7" fill="#5EEAD4" stroke="#4B3A2F" strokeWidth="2.5"/>
      {/* Lid bottom straight edge cover */}
      <rect x="10" y="38" width="76" height="8" rx="0" fill="#5EEAD4" stroke="none"/>

      {/* Lid latch */}
      <rect x="40" y="37" width="16" height="8" rx="3" fill="#F5F1E8" stroke="#4B3A2F" strokeWidth="2"/>
      <circle cx="48" cy="41" r="2" fill="#4B3A2F"/>

      {/* Handle arc */}
      <path
        d="M34 28 C34 18 62 18 62 28"
        stroke="#4B3A2F"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Handle attachment knobs */}
      <rect x="30" y="25" width="8" height="7" rx="3" fill="#5EEAD4" stroke="#4B3A2F" strokeWidth="2"/>
      <rect x="58" y="25" width="8" height="7" rx="3" fill="#5EEAD4" stroke="#4B3A2F" strokeWidth="2"/>

      {/* Interior divider tray */}
      <rect x="18" y="52" width="60" height="24" rx="3" fill="#F5F1E8" stroke="#4B3A2F" strokeWidth="1.5"/>
      <line x1="48" y1="52" x2="48" y2="76" stroke="#4B3A2F" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Wrench (left compartment) */}
      <rect x="26" y="44" width="6" height="20" rx="2" fill="#5EEAD4" stroke="#4B3A2F" strokeWidth="2"/>
      <rect x="23" y="42" width="12" height="6" rx="2" fill="#5EEAD4" stroke="#4B3A2F" strokeWidth="2"/>
      <rect x="24" y="62" width="5" height="5" rx="1" fill="#5EEAD4" stroke="#4B3A2F" strokeWidth="2"/>

      {/* Screwdriver (right compartment) */}
      <rect x="62" y="44" width="5" height="22" rx="2" fill="#5EEAD4" stroke="#4B3A2F" strokeWidth="2"/>
      <rect x="60" y="42" width="9" height="8" rx="3" fill="#F5F1E8" stroke="#4B3A2F" strokeWidth="2"/>
      <path d="M63 66 L66 70 L63 70 Z" fill="#4B3A2F"/>
    </svg>
  )
}
