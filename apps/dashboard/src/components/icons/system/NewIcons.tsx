// New dock-style icons for OpenRooms
// Style: 96x96 viewBox · thick black stroke (strokeWidth 2.5) · pastel fills · rounded shapes

// API - Connected nodes with directional arrow
export const APIIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="28" width="30" height="40" rx="10" fill="#7DD3FC" stroke="#000" strokeWidth="2.5"/>
    <rect x="54" y="28" width="30" height="40" rx="10" fill="#7DD3FC" stroke="#000" strokeWidth="2.5"/>
    <line x1="42" y1="44" x2="54" y2="44" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="42" y1="52" x2="54" y2="52" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M50 40 L54 44 L50 48" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M46 48 L42 52 L46 56" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="27" cy="44" r="4" fill="#000"/>
    <circle cx="27" cy="56" r="4" fill="#000"/>
    <circle cx="69" cy="44" r="4" fill="#000"/>
    <circle cx="69" cy="56" r="4" fill="#000"/>
  </svg>
)

// SDK - Code brackets with chip
export const SDKIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="18" y="22" width="60" height="52" rx="12" fill="#A5F3FC" stroke="#000" strokeWidth="2.5"/>
    <path d="M36 38 L24 48 L36 58" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M60 38 L72 48 L60 58" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <line x1="44" y1="36" x2="52" y2="60" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

// Agent Clusters - Three robot heads grouped together
export const AgentClustersIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left robot */}
    <rect x="6" y="38" width="28" height="24" rx="8" fill="#FCA5A5" stroke="#000" strokeWidth="2.5"/>
    <circle cx="14" cy="50" r="3" fill="#000"/>
    <circle cx="26" cy="50" r="3" fill="#000"/>
    <line x1="20" y1="38" x2="20" y2="32" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="20" cy="30" r="3" fill="#000"/>
    {/* Center robot (larger) */}
    <rect x="30" y="28" width="36" height="30" rx="10" fill="#5EEAD4" stroke="#000" strokeWidth="2.5"/>
    <circle cx="42" cy="44" r="4" fill="#000"/>
    <circle cx="54" cy="44" r="4" fill="#000"/>
    <rect x="44" y="18" width="8" height="10" rx="4" fill="#000"/>
    <line x1="48" y1="14" x2="48" y2="18" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Right robot */}
    <rect x="62" y="38" width="28" height="24" rx="8" fill="#FCA5A5" stroke="#000" strokeWidth="2.5"/>
    <circle cx="70" cy="50" r="3" fill="#000"/>
    <circle cx="82" cy="50" r="3" fill="#000"/>
    <line x1="76" y1="38" x2="76" y2="32" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="76" cy="30" r="3" fill="#000"/>
    {/* Connection line */}
    <line x1="34" y1="62" x2="62" y2="62" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3"/>
    <line x1="30" y1="62" x2="10" y2="68" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
    <line x1="66" y1="62" x2="86" y2="68" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
  </svg>
)

// Security - Shield with lock
export const SecurityIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M48 14 L76 26 L76 52 C76 66 62 78 48 82 C34 78 20 66 20 52 L20 26 Z"
      fill="#86EFAC" stroke="#000" strokeWidth="2.5" strokeLinejoin="round"/>
    <rect x="38" y="46" width="20" height="18" rx="4" fill="#000"/>
    <path d="M42 46 L42 40 C42 36.7 44.7 34 48 34 C51.3 34 54 36.7 54 40 L54 46"
      stroke="#000" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <circle cx="48" cy="55" r="3" fill="#86EFAC"/>
  </svg>
)

// Compliance - Document with checkmark
export const ComplianceIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="14" width="56" height="68" rx="10" fill="#FDE68A" stroke="#000" strokeWidth="2.5"/>
    <line x1="32" y1="36" x2="64" y2="36" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="32" y1="48" x2="64" y2="48" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="32" y1="60" x2="50" y2="60" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="62" cy="66" r="14" fill="#4ADE80" stroke="#000" strokeWidth="2.5"/>
    <path d="M54 66 L60 72 L70 60" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

// Reports - Bar chart with trend line
export const ReportsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="14" width="68" height="68" rx="12" fill="#C4B5FD" stroke="#000" strokeWidth="2.5"/>
    <rect x="26" y="52" width="12" height="20" rx="3" fill="#000"/>
    <rect x="42" y="38" width="12" height="34" rx="3" fill="#000"/>
    <rect x="58" y="44" width="12" height="28" rx="3" fill="#000"/>
    <path d="M26 36 L42 28 L58 32 L72 24" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="72" cy="24" r="4" fill="#000"/>
  </svg>
)

// Architecture - Blueprint/grid with nodes (orange, matching Control Plane)
export const ArchitectureIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="12" width="72" height="72" rx="12" fill="#FB923C" stroke="#000" strokeWidth="2.5"/>
    {/* Grid lines */}
    <line x1="12" y1="36" x2="84" y2="36" stroke="#000" strokeWidth="1" opacity="0.3"/>
    <line x1="12" y1="60" x2="84" y2="60" stroke="#000" strokeWidth="1" opacity="0.3"/>
    <line x1="36" y1="12" x2="36" y2="84" stroke="#000" strokeWidth="1" opacity="0.3"/>
    <line x1="60" y1="12" x2="60" y2="84" stroke="#000" strokeWidth="1" opacity="0.3"/>
    {/* Nodes */}
    <circle cx="36" cy="36" r="7" fill="#000"/>
    <circle cx="60" cy="36" r="7" fill="#000"/>
    <circle cx="48" cy="60" r="7" fill="#000"/>
    {/* Connection lines */}
    <line x1="43" y1="36" x2="53" y2="36" stroke="#000" strokeWidth="2.5"/>
    <line x1="40" y1="42" x2="45" y2="54" stroke="#000" strokeWidth="2.5"/>
    <line x1="56" y1="42" x2="51" y2="54" stroke="#000" strokeWidth="2.5"/>
  </svg>
)

// Distributed Execution - Stacked parallel worker layers
export const DistributedExecutionIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top layer */}
    <rect x="14" y="16" width="68" height="16" rx="6" fill="#C4B5FD" stroke="#000" strokeWidth="2.5"/>
    <circle cx="28" cy="24" r="4" fill="#000"/>
    <circle cx="42" cy="24" r="4" fill="#000"/>
    <circle cx="56" cy="24" r="4" fill="#000"/>
    {/* Middle layer */}
    <rect x="14" y="40" width="68" height="16" rx="6" fill="#C4B5FD" stroke="#000" strokeWidth="2.5"/>
    <circle cx="28" cy="48" r="4" fill="#000"/>
    <circle cx="42" cy="48" r="4" fill="#000"/>
    <circle cx="56" cy="48" r="4" fill="#000"/>
    {/* Bottom layer */}
    <rect x="14" y="64" width="68" height="16" rx="6" fill="#C4B5FD" stroke="#000" strokeWidth="2.5"/>
    <circle cx="28" cy="72" r="4" fill="#000"/>
    <circle cx="42" cy="72" r="4" fill="#000"/>
    <circle cx="56" cy="72" r="4" fill="#000"/>
    {/* Right status indicators */}
    <circle cx="74" cy="24" r="3" fill="#4ADE80"/>
    <circle cx="74" cy="48" r="3" fill="#4ADE80"/>
    <circle cx="74" cy="72" r="3" fill="#FBBF24"/>
  </svg>
)

// Observability - Eye with waveform monitor
export const ObservabilityIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Screen */}
    <rect x="12" y="20" width="72" height="44" rx="10" fill="#86EFAC" stroke="#000" strokeWidth="2.5"/>
    {/* Waveform */}
    <path d="M20 42 L30 42 L36 28 L44 56 L50 42 L60 42 L66 34 L72 42 L76 42"
      stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Stand */}
    <rect x="42" y="64" width="12" height="8" rx="2" fill="#86EFAC" stroke="#000" strokeWidth="2"/>
    <rect x="32" y="72" width="32" height="6" rx="3" fill="#86EFAC" stroke="#000" strokeWidth="2"/>
    {/* Live dot */}
    <circle cx="74" cy="26" r="5" fill="#EF4444" stroke="#000" strokeWidth="2"/>
  </svg>
)

// Enterprise Architecture - Floor plan / blueprint layout
export const EnterpriseArchitectureIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer building frame */}
    <rect x="10" y="14" width="76" height="68" rx="4" fill="#FDE68A" stroke="#000" strokeWidth="2.5"/>
    {/* Inner rooms / floor plan */}
    <rect x="18" y="22" width="28" height="24" rx="3" fill="#FFF" opacity="0.6" stroke="#000" strokeWidth="2"/>
    <rect x="50" y="22" width="28" height="24" rx="3" fill="#FFF" opacity="0.6" stroke="#000" strokeWidth="2"/>
    <rect x="18" y="52" width="60" height="22" rx="3" fill="#FFF" opacity="0.6" stroke="#000" strokeWidth="2"/>
    {/* Door gap */}
    <rect x="42" y="38" width="8" height="8" rx="1" fill="#FDE68A"/>
    {/* Room labels */}
    <circle cx="32" cy="34" r="4" fill="#000"/>
    <circle cx="64" cy="34" r="4" fill="#000"/>
    <line x1="28" y1="63" x2="70" y2="63" stroke="#000" strokeWidth="1.5" strokeDasharray="4 3"/>
  </svg>
)

// Developer - Laptop with </> code brackets (teal fill, distinct from AgentIcon robot)
export const DeveloperIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Laptop lid / screen */}
    <rect x="10" y="20" width="76" height="48" rx="8" fill="#5EEAD4" stroke="#000" strokeWidth="2.5"/>
    {/* Screen bezel inner */}
    <rect x="18" y="28" width="60" height="34" rx="4" fill="#fff" opacity="0.85"/>
    {/* < bracket */}
    <path d="M32 38 L24 45 L32 52" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* > bracket */}
    <path d="M52 38 L60 45 L52 52" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* / slash */}
    <line x1="44" y1="36" x2="40" y2="54" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Laptop hinge */}
    <rect x="10" y="66" width="76" height="4" rx="2" fill="#000" opacity="0.15"/>
    {/* Keyboard base */}
    <rect x="6" y="70" width="84" height="8" rx="4" fill="#5EEAD4" stroke="#000" strokeWidth="2"/>
    {/* Trackpad */}
    <rect x="34" y="72" width="28" height="4" rx="2" fill="#000" opacity="0.25"/>
  </svg>
)

// Build - Hammer and wrench crossed (orange, for BUILD category)
export const BuildIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wrench body */}
    <rect x="20" y="42" width="56" height="14" rx="7" fill="#FDBA74" stroke="#000" strokeWidth="2.5" transform="rotate(-45 48 49)"/>
    {/* Wrench head circle */}
    <circle cx="26" cy="26" r="12" fill="#FDBA74" stroke="#000" strokeWidth="2.5"/>
    <circle cx="26" cy="26" r="5" fill="#fff" stroke="#000" strokeWidth="1.5"/>
    {/* Hammer head */}
    <rect x="58" y="16" width="22" height="16" rx="4" fill="#FB923C" stroke="#000" strokeWidth="2.5"/>
    {/* Hammer handle */}
    <line x1="62" y1="32" x2="42" y2="72" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
    <line x1="62" y1="32" x2="42" y2="72" stroke="#FDBA74" strokeWidth="3" strokeLinecap="round"/>
    {/* Sparkle */}
    <circle cx="72" cy="68" r="4" fill="#FB923C" stroke="#000" strokeWidth="1.5"/>
    <circle cx="80" cy="52" r="3" fill="#FDBA74" stroke="#000" strokeWidth="1.5"/>
  </svg>
)

// Govern / Observe - Telescope pointing at data (rose fill)
export const GovernIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Telescope barrel */}
    <rect x="18" y="38" width="52" height="20" rx="8" fill="#F9A8D4" stroke="#000" strokeWidth="2.5" transform="rotate(-30 44 48)"/>
    {/* Wide end cap */}
    <ellipse cx="22" cy="62" rx="10" ry="6" fill="#F9A8D4" stroke="#000" strokeWidth="2" transform="rotate(-30 22 62)"/>
    {/* Lens / eyepiece */}
    <circle cx="72" cy="28" r="10" fill="#F9A8D4" stroke="#000" strokeWidth="2.5"/>
    <circle cx="72" cy="28" r="4" fill="#fff" stroke="#000" strokeWidth="1.5"/>
    {/* Tripod legs */}
    <line x1="40" y1="68" x2="26" y2="84" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="44" y1="68" x2="44" y2="84" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="48" y1="68" x2="62" y2="84" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Star sparkles (observing) */}
    <circle cx="84" cy="48" r="3" fill="#F9A8D4" stroke="#000" strokeWidth="1.5"/>
    <circle cx="78" cy="58" r="2" fill="#F9A8D4"/>
  </svg>
)

// Integrations - Puzzle pieces connecting
export const IntegrationsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left piece */}
    <path d="M14 26 L42 26 L42 42 C42 42 46 42 46 48 C46 54 42 54 42 54 L42 70 L14 70 L14 54 C14 54 10 54 10 48 C10 42 14 42 14 42 Z"
      fill="#FB923C" stroke="#000" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Right piece */}
    <path d="M54 26 L82 26 L82 42 C82 42 86 42 86 48 C86 54 82 54 82 54 L82 70 L54 70 L54 54 C54 54 50 54 50 48 C50 42 54 42 54 42 Z"
      fill="#FB923C" stroke="#000" strokeWidth="2.5" strokeLinejoin="round"/>
    <circle cx="30" cy="48" r="5" fill="#000"/>
    <circle cx="68" cy="48" r="5" fill="#000"/>
  </svg>
)
