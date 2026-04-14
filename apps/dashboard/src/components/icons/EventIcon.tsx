// Event / Trigger — bell with a signal ring — 96x96, thick stroke, lavender fill
export function EventIcon({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer signal arc left */}
      <path d="M22 26 C14 34 14 62 22 70" stroke="#C4B5FD" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Outer signal arc right */}
      <path d="M74 26 C82 34 82 62 74 70" stroke="#C4B5FD" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Inner signal arc left */}
      <path d="M30 34 C24 40 24 56 30 62" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Inner signal arc right */}
      <path d="M66 34 C72 40 72 56 66 62" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Bell body */}
      <path d="M36 44 C36 34 60 34 60 44 L62 64 H34 Z" fill="#C4B5FD" stroke="#111" strokeWidth="2.5" strokeLinejoin="round"/>
      {/* Bell top */}
      <path d="M44 34 C44 30 52 30 52 34" stroke="#111" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Bell bottom (clapper) */}
      <path d="M42 64 C42 68 54 68 54 64" stroke="#111" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
