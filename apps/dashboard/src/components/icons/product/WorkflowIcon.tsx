// Workflow — monitor showing connected node graph
// 96x96, accent #93C5FD soft blue, cream interior #F5F1E8

export function WorkflowIcon({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Monitor body */}
      <rect x="8" y="10" width="80" height="54" rx="7" fill="#93C5FD" stroke="#4B3A2F" strokeWidth="2.5"/>
      {/* Screen interior */}
      <rect x="16" y="18" width="64" height="38" rx="4" fill="#F5F1E8" stroke="#4B3A2F" strokeWidth="2"/>
      {/* Monitor stand */}
      <rect x="42" y="64" width="12" height="10" rx="2" fill="#93C5FD" stroke="#4B3A2F" strokeWidth="2.5"/>
      {/* Base */}
      <rect x="28" y="74" width="40" height="8" rx="4" fill="#93C5FD" stroke="#4B3A2F" strokeWidth="2.5"/>

      {/* Node graph on screen */}
      {/* Top-left node */}
      <circle cx="34" cy="32" r="5" fill="#93C5FD" stroke="#4B3A2F" strokeWidth="2"/>
      {/* Top-right node */}
      <circle cx="62" cy="32" r="5" fill="#93C5FD" stroke="#4B3A2F" strokeWidth="2"/>
      {/* Bottom center node */}
      <circle cx="48" cy="47" r="5" fill="#93C5FD" stroke="#4B3A2F" strokeWidth="2"/>

      {/* Connections */}
      <line x1="39" y1="34" x2="43" y2="44" stroke="#4B3A2F" strokeWidth="2" strokeLinecap="round"/>
      <line x1="57" y1="34" x2="53" y2="44" stroke="#4B3A2F" strokeWidth="2" strokeLinecap="round"/>
      <line x1="39" y1="32" x2="57" y2="32" stroke="#4B3A2F" strokeWidth="2" strokeLinecap="round"/>

      {/* Node dots (inner fill indicator) */}
      <circle cx="34" cy="32" r="2" fill="#F5F1E8"/>
      <circle cx="62" cy="32" r="2" fill="#F5F1E8"/>
      <circle cx="48" cy="47" r="2" fill="#4B3A2F"/>

      {/* Screen corner dots (monitor indicator lights) */}
      <circle cx="22" cy="22" r="2" fill="#4B3A2F" opacity="0.3"/>
    </svg>
  )
}
