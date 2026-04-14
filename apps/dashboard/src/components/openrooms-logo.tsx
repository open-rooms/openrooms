'use client'

// OpenRooms Logo — two separate cartoon bot faces (coral/prawnish, like the shared rooms image)
// Each bot is a rounded square face with wide eyes and a smile — cartoonated icon style

interface Props {
  size?: number
  showText?: boolean
  textSize?: string
  className?: string
}

export function OpenRoomsLogo({ size = 36, showText = true, textSize = 'text-base', className = '' }: Props) {
  const s = size
  const bot = s * 0.55   // each bot face width/height
  const gap = s * 0.08   // gap between bots

  return (
    <div className={`flex items-center gap-2.5 ${className}`} style={{ userSelect: 'none' }}>
      {/* Two bot faces side by side */}
      <svg width={s} height={s * 0.75} viewBox="0 0 64 48" fill="none">
        {/* ── Bot A (left) ── */}
        {/* Body */}
        <rect x="2" y="10" width="26" height="22" rx="7" fill="#F4A89A" stroke="#111" strokeWidth="2.2"/>
        {/* Ear nubs */}
        <rect x="0" y="16" width="3" height="5" rx="1.5" fill="#E8917F" stroke="#111" strokeWidth="1.5"/>
        <rect x="25" y="16" width="3" height="5" rx="1.5" fill="#E8917F" stroke="#111" strokeWidth="1.5"/>
        {/* Antenna */}
        <line x1="15" y1="10" x2="15" y2="4" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="15" cy="3" r="2.5" fill="#F4A89A" stroke="#111" strokeWidth="1.8"/>
        {/* Eyes — wide cartoon */}
        <ellipse cx="9" cy="20" rx="3.5" ry="4" fill="white" stroke="#111" strokeWidth="1.5"/>
        <circle cx="9" cy="20.5" r="2" fill="#111"/>
        <circle cx="10" cy="19.5" r="0.7" fill="white"/>
        <ellipse cx="21" cy="20" rx="3.5" ry="4" fill="white" stroke="#111" strokeWidth="1.5"/>
        <circle cx="21" cy="20.5" r="2" fill="#111"/>
        <circle cx="22" cy="19.5" r="0.7" fill="white"/>
        {/* Smile */}
        <path d="M9 27 Q15 31.5 21 27" stroke="#111" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Cheeks */}
        <circle cx="6.5" cy="25" r="2.5" fill="#F87171" opacity="0.45"/>
        <circle cx="23.5" cy="25" r="2.5" fill="#F87171" opacity="0.45"/>

        {/* ── Bot B (right) ── */}
        {/* Body */}
        <rect x="36" y="10" width="26" height="22" rx="7" fill="#F4A89A" stroke="#111" strokeWidth="2.2"/>
        {/* Ear nubs */}
        <rect x="34" y="16" width="3" height="5" rx="1.5" fill="#E8917F" stroke="#111" strokeWidth="1.5"/>
        <rect x="59" y="16" width="3" height="5" rx="1.5" fill="#E8917F" stroke="#111" strokeWidth="1.5"/>
        {/* Antenna — slight tilt for personality */}
        <line x1="49" y1="10" x2="52" y2="4" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="52.5" cy="3" r="2.5" fill="#F4A89A" stroke="#111" strokeWidth="1.8"/>
        {/* Eyes */}
        <ellipse cx="43" cy="20" rx="3.5" ry="4" fill="white" stroke="#111" strokeWidth="1.5"/>
        <circle cx="43" cy="20.5" r="2" fill="#111"/>
        <circle cx="44" cy="19.5" r="0.7" fill="white"/>
        <ellipse cx="55" cy="20" rx="3.5" ry="4" fill="white" stroke="#111" strokeWidth="1.5"/>
        <circle cx="55" cy="20.5" r="2" fill="#111"/>
        <circle cx="56" cy="19.5" r="0.7" fill="white"/>
        {/* Smile — slightly different (open) */}
        <path d="M43 27 Q49 32 55 27" stroke="#111" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Cheeks */}
        <circle cx="40.5" cy="25" r="2.5" fill="#F87171" opacity="0.45"/>
        <circle cx="57.5" cy="25" r="2.5" fill="#F87171" opacity="0.45"/>

        {/* Ground / shadow line */}
        <ellipse cx="15" cy="35" rx="11" ry="2.5" fill="#111" opacity="0.07"/>
        <ellipse cx="49" cy="35" rx="11" ry="2.5" fill="#111" opacity="0.07"/>
      </svg>

      {showText && (
        <span className={`font-extrabold tracking-tight text-[#111] ${textSize}`}>
          OpenRooms
        </span>
      )}
    </div>
  )
}
