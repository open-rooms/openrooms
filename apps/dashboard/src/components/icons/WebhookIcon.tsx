// Webhook — lightning bolt through a ring — 96x96, thick stroke, amber fill
export function WebhookIcon({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring */}
      <circle cx="48" cy="48" r="34" fill="#FCD34D" stroke="#111" strokeWidth="2.5"/>
      {/* Inner ring */}
      <circle cx="48" cy="48" r="20" fill="#F9F5EF" stroke="#111" strokeWidth="2"/>
      {/* Lightning bolt */}
      <path d="M52 26 L40 50 L50 50 L44 72 L58 46 L48 46 Z" fill="#111" stroke="#111" strokeWidth="1" strokeLinejoin="round"/>
      {/* Small connection dots on ring */}
      <circle cx="48" cy="14" r="4" fill="#111"/>
      <circle cx="48" cy="82" r="4" fill="#111"/>
      <circle cx="14" cy="48" r="4" fill="#111"/>
      <circle cx="82" cy="48" r="4" fill="#111"/>
    </svg>
  )
}
