// Trigger / Play — a hand pressing a big button — 96x96, thick stroke, coral fill
export function TriggerIcon({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Big round button */}
      <circle cx="44" cy="42" r="28" fill="#FCA5A5" stroke="#111" strokeWidth="2.5"/>
      {/* Button inner shadow ring */}
      <circle cx="44" cy="42" r="21" fill="#F87171" stroke="#111" strokeWidth="1.5"/>
      {/* Play triangle */}
      <path d="M38 32 L38 52 L56 42 Z" fill="#111" stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Hand/finger pressing */}
      <path d="M60 56 C64 52 72 54 72 60 L72 72 C72 76 68 78 64 76 L54 70"
        fill="#FEF3C7" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Press ripple */}
      <circle cx="44" cy="42" r="32" stroke="#FCA5A5" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  )
}
