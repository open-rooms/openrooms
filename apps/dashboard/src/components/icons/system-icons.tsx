// System Icons for OpenRooms
// PostHog-inspired filled product icon style
// Combines outline strokes + filled shapes + muted product colors

const colors = {
  roomsRed: '#E24A3B',
  roomsOrange: '#F59E0B',
  roomsBlue: '#4F8FF7',
  roomsRust: '#A8642A',
  roomsBrown: '#7A5C3E',
  roomsGray: '#6B7280',
  roomsSlate: '#475569',
  roomsSand: '#D6C7A8',
  roomsAmber: '#E6A23C',
}

// Control Plane Icons

export const SystemHealthIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Terminal monitor frame */}
    <rect x="3" y="4" width="18" height="14" rx="2" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsSand}/>
    {/* Heartbeat line */}
    <path d="M6 11 L9 11 L10 8 L12 14 L14 8 L15 11 L18 11" stroke={colors.roomsRed} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Bottom bar */}
    <rect x="3" y="18" width="18" height="3" rx="1" fill={colors.roomsSlate}/>
  </svg>
)

export const DatabaseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top cylinder */}
    <ellipse cx="12" cy="6" rx="7" ry="3" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsSand}/>
    {/* Middle cylinder - filled */}
    <path d="M5 10 C5 11.66 8.13 13 12 13 C15.87 13 19 11.66 19 10" stroke={colors.roomsSlate} strokeWidth="2.5" fill="none"/>
    <rect x="5" y="10" width="14" height="3" fill={colors.roomsBlue}/>
    <line x1="5" y1="10" x2="5" y2="13" stroke={colors.roomsSlate} strokeWidth="2.5"/>
    <line x1="19" y1="10" x2="19" y2="13" stroke={colors.roomsSlate} strokeWidth="2.5"/>
    {/* Bottom cylinder */}
    <path d="M5 17 C5 18.66 8.13 20 12 20 C15.87 20 19 18.66 19 17" stroke={colors.roomsSlate} strokeWidth="2.5" fill="none"/>
    <line x1="5" y1="13" x2="5" y2="17" stroke={colors.roomsSlate} strokeWidth="2.5"/>
    <line x1="19" y1="13" x2="19" y2="17" stroke={colors.roomsSlate} strokeWidth="2.5"/>
  </svg>
)

export const RedisCacheIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Memory chip body */}
    <rect x="6" y="6" width="12" height="12" rx="2" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsSand}/>
    {/* Chip pins */}
    <line x1="4" y1="9" x2="6" y2="9" stroke={colors.roomsSlate} strokeWidth="2"/>
    <line x1="4" y1="12" x2="6" y2="12" stroke={colors.roomsSlate} strokeWidth="2"/>
    <line x1="4" y1="15" x2="6" y2="15" stroke={colors.roomsSlate} strokeWidth="2"/>
    <line x1="18" y1="9" x2="20" y2="9" stroke={colors.roomsSlate} strokeWidth="2"/>
    <line x1="18" y1="12" x2="20" y2="12" stroke={colors.roomsSlate} strokeWidth="2"/>
    <line x1="18" y1="15" x2="20" y2="15" stroke={colors.roomsSlate} strokeWidth="2"/>
    {/* Lightning bolt - filled */}
    <path d="M13 8 L10 13 L12 13 L11 16 L14 11 L12 11 L13 8 Z" fill={colors.roomsOrange} stroke={colors.roomsRust} strokeWidth="1"/>
  </svg>
)

export const WorkersIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left gear */}
    <circle cx="8" cy="12" r="4" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsBlue}/>
    <circle cx="8" cy="12" r="2" fill={colors.roomsSand}/>
    {/* Right gear */}
    <circle cx="16" cy="12" r="4" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsBlue}/>
    <circle cx="16" cy="12" r="2" fill={colors.roomsSand}/>
    {/* Top gear */}
    <circle cx="12" cy="6" r="3" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsAmber}/>
    <circle cx="12" cy="6" r="1.5" fill={colors.roomsSand}/>
  </svg>
)

export const APIIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left node */}
    <circle cx="6" cy="12" r="3.5" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsBlue}/>
    <circle cx="6" cy="12" r="1.5" fill={colors.roomsSand}/>
    {/* Right node */}
    <circle cx="18" cy="12" r="3.5" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsAmber}/>
    <circle cx="18" cy="12" r="1.5" fill={colors.roomsSand}/>
    {/* Connection arrow */}
    <line x1="9.5" y1="12" x2="14.5" y2="12" stroke={colors.roomsSlate} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M13 10 L15 12 L13 14" stroke={colors.roomsSlate} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

export const AgentRuntimeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Terminal window */}
    <rect x="3" y="5" width="18" height="14" rx="2" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsSand}/>
    {/* Robot face inside */}
    <rect x="8" y="9" width="8" height="7" rx="2" stroke={colors.roomsSlate} strokeWidth="2" fill={colors.roomsBlue}/>
    <circle cx="11" cy="12" r="1" fill={colors.roomsSand}/>
    <circle cx="13" cy="12" r="1" fill={colors.roomsSand}/>
    <line x1="10.5" y1="14.5" x2="13.5" y2="14.5" stroke={colors.roomsSand} strokeWidth="1.5" strokeLinecap="round"/>
    {/* Antenna */}
    <line x1="12" y1="9" x2="12" y2="7" stroke={colors.roomsSlate} strokeWidth="2"/>
    <circle cx="12" cy="6.5" r="0.8" fill={colors.roomsRed}/>
  </svg>
)

export const ResourceLimitsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Gauge circle */}
    <circle cx="12" cy="14" r="8" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsSand}/>
    {/* Colored meter fill */}
    <path d="M12 14 L12 6" stroke={colors.roomsRed} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M12 14 A8 8 0 0 1 6.34 9.17" stroke={colors.roomsAmber} strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* Center dot */}
    <circle cx="12" cy="14" r="2" fill={colors.roomsSlate}/>
    {/* Tick marks */}
    <line x1="6" y1="9" x2="7" y2="10" stroke={colors.roomsGray} strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="6" x2="12" y2="7.5" stroke={colors.roomsGray} strokeWidth="2" strokeLinecap="round"/>
    <line x1="18" y1="9" x2="17" y2="10" stroke={colors.roomsGray} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const PoliciesIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shield outline */}
    <path d="M12 3 L4 7 L4 13 C4 17 7 20 12 21 C17 20 20 17 20 13 L20 7 Z" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsSand}/>
    {/* Filled center badge */}
    <circle cx="12" cy="12" r="4" fill={colors.roomsBlue}/>
    {/* Check mark */}
    <path d="M10 12 L11.5 13.5 L14 11" stroke={colors.roomsSand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

// Agent Icons

export const AgentListIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Robot head */}
    <rect x="6" y="7" width="12" height="11" rx="3" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsBlue}/>
    {/* Eyes */}
    <circle cx="10" cy="12" r="1.5" fill={colors.roomsSand}/>
    <circle cx="14" cy="12" r="1.5" fill={colors.roomsSand}/>
    {/* Smile */}
    <path d="M10 15 Q12 16.5 14 15" stroke={colors.roomsSand} strokeWidth="2" strokeLinecap="round" fill="none"/>
    {/* Antenna */}
    <line x1="12" y1="7" x2="12" y2="4" stroke={colors.roomsSlate} strokeWidth="2.5"/>
    <circle cx="12" cy="3" r="1.2" fill={colors.roomsRed}/>
  </svg>
)

export const WorkflowListIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Connected nodes */}
    <circle cx="6" cy="8" r="3" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsAmber}/>
    <circle cx="18" cy="8" r="3" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsBlue}/>
    <circle cx="12" cy="16" r="3" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsRed}/>
    {/* Connection lines */}
    <line x1="8.5" y1="9.5" x2="10.5" y2="14.5" stroke={colors.roomsSlate} strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="15.5" y1="9.5" x2="13.5" y2="14.5" stroke={colors.roomsSlate} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

// Runtime Icons

export const RuntimeMonitorIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Monitor screen */}
    <rect x="3" y="4" width="18" height="13" rx="2" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsSand}/>
    {/* Activity wave inside */}
    <path d="M6 10.5 L9 10.5 L10 8 L12 13 L14 7 L16 11 L18 10.5" stroke={colors.roomsBlue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Metrics dots */}
    <circle cx="7" cy="14" r="1" fill={colors.roomsAmber}/>
    <circle cx="12" cy="14" r="1" fill={colors.roomsRed}/>
    <circle cx="17" cy="14" r="1" fill={colors.roomsBlue}/>
    {/* Base */}
    <rect x="8" y="17" width="8" height="2" rx="1" fill={colors.roomsSlate}/>
  </svg>
)

export const JobQueueIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stacked job blocks */}
    <rect x="4" y="15" width="10" height="4" rx="1" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsBlue}/>
    <rect x="4" y="10" width="10" height="4" rx="1" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsAmber} opacity="0.7"/>
    <rect x="4" y="5" width="10" height="4" rx="1" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsSand} opacity="0.5"/>
    {/* Processing arrow */}
    <line x1="14" y1="17" x2="17" y2="17" stroke={colors.roomsSlate} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M16 15.5 L18 17 L16 18.5" stroke={colors.roomsSlate} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Processor */}
    <rect x="18" y="14" width="4" height="6" rx="1" fill={colors.roomsRed}/>
  </svg>
)

// Tools Icons

export const ToolRegistryIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Toolbox */}
    <rect x="4" y="10" width="16" height="9" rx="2" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsSand}/>
    {/* Handle */}
    <path d="M9 10 L9 8 C9 6.34 10.34 5 12 5 C13.66 5 15 6.34 15 8 L15 10" stroke={colors.roomsSlate} strokeWidth="2.5" fill="none"/>
    {/* Wrench inside */}
    <path d="M10 13 L11 14 L14 11" stroke={colors.roomsBlue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="14" cy="16" r="1.5" fill={colors.roomsRed}/>
  </svg>
)

// Live Runs Icons

export const LiveActivityIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Activity monitor */}
    <rect x="3" y="5" width="18" height="14" rx="2" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsSand}/>
    {/* Live pulse */}
    <path d="M6 12 L8 12 L10 8 L12 16 L14 10 L16 12 L18 12" stroke={colors.roomsRed} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Live indicator */}
    <circle cx="7" cy="8" r="1.5" fill={colors.roomsRed}/>
  </svg>
)

export const ExecutionTraceIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Timeline container */}
    <rect x="4" y="6" width="16" height="12" rx="2" stroke={colors.roomsSlate} strokeWidth="2.5" fill={colors.roomsSand}/>
    {/* Trace events */}
    <circle cx="8" cy="10" r="1.5" fill={colors.roomsBlue}/>
    <circle cx="12" cy="10" r="1.5" fill={colors.roomsAmber}/>
    <circle cx="16" cy="10" r="1.5" fill={colors.roomsRed}/>
    {/* Timeline lines */}
    <line x1="8" y1="10" x2="12" y2="10" stroke={colors.roomsGray} strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="10" x2="16" y2="10" stroke={colors.roomsGray} strokeWidth="2" strokeLinecap="round"/>
    {/* Detail bars */}
    <line x1="7" y1="14" x2="11" y2="14" stroke={colors.roomsBlue} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="13" y1="14" x2="17" y2="14" stroke={colors.roomsRed} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
