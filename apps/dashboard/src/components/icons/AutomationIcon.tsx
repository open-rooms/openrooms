export const AutomationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="48" cy="48" r="30" fill="#EF4444" stroke="#000" strokeWidth="2.5"/>
    <circle cx="48" cy="48" r="20" fill="none" stroke="#000" strokeWidth="2.5"/>
    <path d="M48 28 L48 38" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M68 48 L58 48" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M48 68 L48 58" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M28 48 L38 48" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="48" cy="28" r="4" fill="#000"/>
    <circle cx="68" cy="48" r="4" fill="#000"/>
    <circle cx="48" cy="68" r="4" fill="#000"/>
    <circle cx="28" cy="48" r="4" fill="#000"/>
  </svg>
)
