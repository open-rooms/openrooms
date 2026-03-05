// OpenRooms Product Icon System
// Illustrated icons with solid fills and brown stroke
// Represents real objects: robots, toolboxes, consoles, monitors, pipes

const strokeColor = '#4B3A2F'
const strokeWidth = 1.6

const colors = {
  controlPlane: '#E0B35A',
  workflows: '#7FA7D8',
  automation: '#C97B63',
  agents: '#69B6A4',
  runs: '#F2994A',
  logs: '#B08968',
  tools: '#E0C36A',
  storage: '#8FA1B3',
  api: '#7D8C8F',
  metrics: '#A77DC2',
  alerts: '#D46A6A',
  settings: '#9DA4AA',
}

// Control Plane - Dashboard with dials
export const ControlPlaneIllustrationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dashboard panel */}
    <rect x="3" y="4" width="18" height="16" rx="2" fill={colors.controlPlane} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Gauge dials */}
    <circle cx="8" cy="10" r="2.5" fill="#FFF" opacity="0.3" stroke={strokeColor} strokeWidth={strokeWidth}/>
    <circle cx="16" cy="10" r="2.5" fill="#FFF" opacity="0.3" stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Indicator lights */}
    <circle cx="7" cy="16" r="1" fill="#4ADE80"/>
    <circle cx="12" cy="16" r="1" fill="#4ADE80"/>
    <circle cx="17" cy="16" r="1" fill="#FBBF24"/>
  </svg>
)

// Workflows - Connected pipes/nodes
export const WorkflowsIllustrationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Pipeline nodes */}
    <circle cx="6" cy="12" r="3" fill={colors.workflows} stroke={strokeColor} strokeWidth={strokeWidth}/>
    <circle cx="18" cy="12" r="3" fill={colors.workflows} stroke={strokeColor} strokeWidth={strokeWidth}/>
    <circle cx="12" cy="6" r="2.5" fill={colors.workflows} stroke={strokeColor} strokeWidth={strokeWidth}/>
    <circle cx="12" cy="18" r="2.5" fill={colors.workflows} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Connection pipes */}
    <line x1="9" y1="12" x2="15" y2="12" stroke={strokeColor} strokeWidth={strokeWidth}/>
    <line x1="12" y1="8.5" x2="12" y2="9.5" stroke={strokeColor} strokeWidth={strokeWidth}/>
    <line x1="12" y1="14.5" x2="12" y2="15.5" stroke={strokeColor} strokeWidth={strokeWidth}/>
  </svg>
)

// Automation - Gear mechanism
export const AutomationIllustrationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Large gear */}
    <circle cx="10" cy="12" r="6" fill={colors.automation} stroke={strokeColor} strokeWidth={strokeWidth}/>
    <circle cx="10" cy="12" r="3" fill="#FFF" opacity="0.3" stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Gear teeth */}
    <rect x="9" y="5" width="2" height="2" rx="0.5" fill={colors.automation} stroke={strokeColor} strokeWidth="0.8"/>
    <rect x="15" y="11" width="2" height="2" rx="0.5" fill={colors.automation} stroke={strokeColor} strokeWidth="0.8"/>
    <rect x="9" y="17" width="2" height="2" rx="0.5" fill={colors.automation} stroke={strokeColor} strokeWidth="0.8"/>
    <rect x="3" y="11" width="2" height="2" rx="0.5" fill={colors.automation} stroke={strokeColor} strokeWidth="0.8"/>
    {/* Small gear */}
    <circle cx="17" cy="9" r="3.5" fill={colors.automation} stroke={strokeColor} strokeWidth={strokeWidth}/>
    <circle cx="17" cy="9" r="1.5" fill="#FFF" opacity="0.3"/>
  </svg>
)

// Agents - Robot face
export const AgentsIllustrationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Robot head */}
    <rect x="6" y="8" width="12" height="11" rx="3" fill={colors.agents} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Eyes */}
    <rect x="9" y="11" width="2" height="3" rx="1" fill="#FFF"/>
    <rect x="13" y="11" width="2" height="3" rx="1" fill="#FFF"/>
    {/* Mouth */}
    <rect x="10" y="16" width="4" height="1.5" rx="0.75" fill="#FFF" opacity="0.5"/>
    {/* Antenna */}
    <line x1="12" y1="8" x2="12" y2="5" stroke={strokeColor} strokeWidth={strokeWidth}/>
    <circle cx="12" cy="4" r="1.5" fill={colors.agents} stroke={strokeColor} strokeWidth={strokeWidth}/>
  </svg>
)

// Runs - Play button console
export const RunsIllustrationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Console screen */}
    <rect x="4" y="5" width="16" height="12" rx="2" fill={colors.runs} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Play triangle */}
    <path d="M10 9 L10 15 L15 12 Z" fill="#FFF" stroke={strokeColor} strokeWidth="1"/>
    {/* Base */}
    <rect x="7" y="17" width="10" height="2" rx="1" fill={colors.runs} stroke={strokeColor} strokeWidth={strokeWidth}/>
  </svg>
)

// Logs - Scrolled document
export const LogsIllustrationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Document */}
    <rect x="6" y="3" width="12" height="18" rx="2" fill={colors.logs} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Log lines */}
    <line x1="9" y1="7" x2="15" y2="7" stroke="#FFF" strokeWidth="1.5" opacity="0.6"/>
    <line x1="9" y1="10" x2="15" y2="10" stroke="#FFF" strokeWidth="1.5" opacity="0.6"/>
    <line x1="9" y1="13" x2="13" y2="13" stroke="#FFF" strokeWidth="1.5" opacity="0.6"/>
    <line x1="9" y1="16" x2="15" y2="16" stroke="#FFF" strokeWidth="1.5" opacity="0.6"/>
    {/* Bullet points */}
    <circle cx="9" cy="7" r="0.8" fill="#FFF"/>
    <circle cx="9" cy="10" r="0.8" fill="#FFF"/>
    <circle cx="9" cy="13" r="0.8" fill="#FFF"/>
    <circle cx="9" cy="16" r="0.8" fill="#FFF"/>
  </svg>
)

// Tools - Toolbox
export const ToolsIllustrationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Toolbox body */}
    <rect x="4" y="10" width="16" height="10" rx="2" fill={colors.tools} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Toolbox top/lid */}
    <path d="M6 10 L6 8 C6 6.89 6.89 6 8 6 L16 6 C17.11 6 18 6.89 18 8 L18 10" fill={colors.tools} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Handle */}
    <path d="M10 10 L10 8 L14 8 L14 10" stroke={strokeColor} strokeWidth={strokeWidth} fill="none"/>
    {/* Tool highlights */}
    <circle cx="10" cy="15" r="1" fill="#FFF" opacity="0.5"/>
    <circle cx="14" cy="15" r="1" fill="#FFF" opacity="0.5"/>
  </svg>
)

// Storage - Database stack
export const StorageIllustrationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top cylinder */}
    <ellipse cx="12" cy="7" rx="6" ry="3" fill={colors.storage} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Middle section */}
    <rect x="6" y="7" width="12" height="5" fill={colors.storage}/>
    <ellipse cx="12" cy="12" rx="6" ry="3" fill={colors.storage} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Bottom section */}
    <rect x="6" y="12" width="12" height="5" fill={colors.storage}/>
    <ellipse cx="12" cy="17" rx="6" ry="3" fill={colors.storage} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Side lines */}
    <line x1="6" y1="7" x2="6" y2="17" stroke={strokeColor} strokeWidth={strokeWidth}/>
    <line x1="18" y1="7" x2="18" y2="17" stroke={strokeColor} strokeWidth={strokeWidth}/>
  </svg>
)

// API - Connected nodes with arrow
export const APIIllustrationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left node */}
    <rect x="3" y="9" width="6" height="6" rx="2" fill={colors.api} stroke={strokeColor} strokeWidth={strokeWidth}/>
    <circle cx="6" cy="12" r="1.5" fill="#FFF" opacity="0.5"/>
    {/* Right node */}
    <rect x="15" y="9" width="6" height="6" rx="2" fill={colors.api} stroke={strokeColor} strokeWidth={strokeWidth}/>
    <circle cx="18" cy="12" r="1.5" fill="#FFF" opacity="0.5"/>
    {/* Connection arrow */}
    <line x1="9" y1="12" x2="15" y2="12" stroke={strokeColor} strokeWidth={strokeWidth}/>
    <path d="M13 10 L15 12 L13 14" stroke={strokeColor} strokeWidth={strokeWidth} fill="none"/>
  </svg>
)

// Metrics - Bar chart
export const MetricsIllustrationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chart bars */}
    <rect x="5" y="12" width="3" height="7" rx="1" fill={colors.metrics} stroke={strokeColor} strokeWidth={strokeWidth}/>
    <rect x="10" y="8" width="3" height="11" rx="1" fill={colors.metrics} stroke={strokeColor} strokeWidth={strokeWidth}/>
    <rect x="15" y="10" width="3" height="9" rx="1" fill={colors.metrics} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Trend arrow */}
    <path d="M4 6 L10 10 L16 7 L20 9" stroke={strokeColor} strokeWidth={strokeWidth} fill="none"/>
    <path d="M18 8 L20 9 L19 11" stroke={strokeColor} strokeWidth={strokeWidth} fill="none"/>
  </svg>
)

// Alerts - Bell with notification
export const AlertsIllustrationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bell body */}
    <path d="M12 4 C9.5 4 8 6 8 8 L8 12 C8 14 6 15 5 16 L19 16 C18 15 16 14 16 12 L16 8 C16 6 14.5 4 12 4 Z" fill={colors.alerts} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Bell clapper */}
    <path d="M10.5 17 C10.5 18.38 11.12 19 12 19 C12.88 19 13.5 18.38 13.5 17" stroke={strokeColor} strokeWidth={strokeWidth} fill="none"/>
    {/* Notification dot */}
    <circle cx="16" cy="7" r="2.5" fill="#EF4444" stroke={strokeColor} strokeWidth={strokeWidth}/>
  </svg>
)

// Settings - Wrench and screwdriver
export const SettingsIllustrationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wrench */}
    <path d="M7 15 L10 12 L9 11 C8 10 8 8.5 9 7.5 C10 6.5 11.5 6.5 12.5 7.5 L14 9 L12 11 L15 14 L17 12 L18.5 13.5 C19.5 14.5 19.5 16 18.5 17 C17.5 18 16 18 15 17 L14 16 L11 19 L9 17 L7 15 Z" fill={colors.settings} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Screwdriver handle */}
    <rect x="4" y="4" width="4" height="6" rx="1" fill={colors.settings} stroke={strokeColor} strokeWidth={strokeWidth}/>
    {/* Screwdriver shaft */}
    <rect x="5.2" y="10" width="1.6" height="5" fill={colors.settings} stroke={strokeColor} strokeWidth="1"/>
  </svg>
)
