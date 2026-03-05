export const SettingsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="48" cy="48" r="32" fill="#FB923C" stroke="#000" strokeWidth="2.5"/>
    <circle cx="48" cy="48" r="12" fill="#000"/>
    <rect x="46" y="16" width="4" height="12" rx="2" fill="#000"/>
    <rect x="46" y="68" width="4" height="12" rx="2" fill="#000"/>
    <rect x="68" y="46" width="12" height="4" ry="2" fill="#000"/>
    <rect x="16" y="46" width="12" height="4" ry="2" fill="#000"/>
    <rect x="64" y="24" width="4" height="10" rx="2" fill="#000" transform="rotate(45 66 29)"/>
    <rect x="28" y="62" width="4" height="10" rx="2" fill="#000" transform="rotate(45 30 67)"/>
    <rect x="62" y="64" width="4" height="10" rx="2" fill="#000" transform="rotate(-45 64 69)"/>
    <rect x="26" y="26" width="4" height="10" rx="2" fill="#000" transform="rotate(-45 28 31)"/>
  </svg>
)
