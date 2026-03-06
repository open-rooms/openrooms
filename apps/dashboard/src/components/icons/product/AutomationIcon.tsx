// Automation — gear machine inside a console frame
// 96x96, accent #FDBA74 soft orange, cream interior #F5F1E8

export function AutomationIcon({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Console body */}
      <rect x="10" y="12" width="76" height="68" rx="8" fill="#FDBA74" stroke="#4B3A2F" strokeWidth="2.5"/>
      {/* Console screen interior */}
      <rect x="18" y="20" width="60" height="44" rx="4" fill="#F5F1E8" stroke="#4B3A2F" strokeWidth="2"/>
      {/* Bottom control strip */}
      <rect x="10" y="66" width="76" height="14" rx="0" fill="#FDBA74" stroke="none"/>
      <rect x="10" y="66" width="76" height="14" rx="8" fill="#FDBA74" stroke="#4B3A2F" strokeWidth="2.5"/>

      {/* Status lights on control strip */}
      <circle cx="28" cy="73" r="3.5" fill="#4ADE80" stroke="#4B3A2F" strokeWidth="1.5"/>
      <circle cx="40" cy="73" r="3.5" fill="#FCD34D" stroke="#4B3A2F" strokeWidth="1.5"/>
      <circle cx="52" cy="73" r="3.5" fill="#F5F1E8" stroke="#4B3A2F" strokeWidth="1.5"/>

      {/* Large gear on screen */}
      <circle cx="44" cy="40" r="14" fill="#FDBA74" stroke="#4B3A2F" strokeWidth="2.5"/>
      <circle cx="44" cy="40" r="6" fill="#F5F1E8" stroke="#4B3A2F" strokeWidth="2"/>
      {/* Gear teeth — top, right, bottom, left, diagonals */}
      <rect x="41" y="22" width="6" height="6" rx="1.5" fill="#FDBA74" stroke="#4B3A2F" strokeWidth="2"/>
      <rect x="56" y="37" width="6" height="6" rx="1.5" fill="#FDBA74" stroke="#4B3A2F" strokeWidth="2"/>
      <rect x="41" y="52" width="6" height="6" rx="1.5" fill="#FDBA74" stroke="#4B3A2F" strokeWidth="2"/>
      <rect x="26" y="37" width="6" height="6" rx="1.5" fill="#FDBA74" stroke="#4B3A2F" strokeWidth="2"/>

      {/* Small meshing gear */}
      <circle cx="64" cy="30" r="8" fill="#FDBA74" stroke="#4B3A2F" strokeWidth="2"/>
      <circle cx="64" cy="30" r="3" fill="#F5F1E8" stroke="#4B3A2F" strokeWidth="1.5"/>
      {/* Small gear teeth */}
      <rect x="62" y="20" width="4" height="4" rx="1" fill="#FDBA74" stroke="#4B3A2F" strokeWidth="1.5"/>
      <rect x="70" y="28" width="4" height="4" rx="1" fill="#FDBA74" stroke="#4B3A2F" strokeWidth="1.5"/>
      <rect x="62" y="36" width="4" height="4" rx="1" fill="#FDBA74" stroke="#4B3A2F" strokeWidth="1.5"/>
      <rect x="54" y="28" width="4" height="4" rx="1" fill="#FDBA74" stroke="#4B3A2F" strokeWidth="1.5"/>
    </svg>
  )
}
