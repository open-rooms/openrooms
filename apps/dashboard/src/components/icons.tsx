// Custom SVG Icons for OpenRooms
// Original designs with coral brand identity

export const RoomIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
    <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
    <path d="M8 14 Q12 16 16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
)

export const WorkflowIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="12" r="2" fill="currentColor"/>
    <circle cx="18" cy="12" r="2" fill="currentColor"/>
    <circle cx="12" cy="6" r="2" fill="currentColor"/>
    <circle cx="12" cy="18" r="2" fill="currentColor"/>
    <path d="M8 12 L16 12 M12 8 L12 10 M12 14 L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const LogIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="7" cy="6" r="1.5" fill="currentColor"/>
    <circle cx="7" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="7" cy="18" r="1.5" fill="currentColor"/>
  </svg>
)

export const ToolIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const DashboardIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
    <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.4"/>
  </svg>
)

export const SettingsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 1v6m0 6v6M23 12h-6m-6 0H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const PlayIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

export const RefreshIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const ChevronRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const ActivityIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const TrendUpIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 6l-9.5 9.5-5-5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const TrendDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 18l-9.5-9.5-5 5L1 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 18h6v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const CheckCircleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const AlertCircleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const ZapIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
  </svg>
)

export const DatabaseIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke="currentColor" strokeWidth="2"/>
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" stroke="currentColor" strokeWidth="2"/>
  </svg>
)

export const CpuIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
    <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 2v2m6-2v2M9 20v2m6-2v2M2 9h2m-2 6h2m16-6h2m-2 6h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const MemoryIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 10h4m4 0h4M6 14h4m4 0h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const AgentIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M6 21v-2a6 6 0 0 1 12 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
  </svg>
)

export const RuntimeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5v14l11-7z" fill="currentColor"/>
    <rect x="3" y="4" width="2" height="16" fill="currentColor"/>
  </svg>
)

export const AutomationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
    <path d="M12 1v4m0 14v4M23 12h-4m-14 0H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="20" r="1.5" fill="currentColor"/>
    <circle cx="20" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
  </svg>
)

export const LiveRunsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const PlusIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

// Workflow Template Icons
export const SequentialWorkflowIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="3" width="14" height="18" rx="3" stroke="#8B7FF5" strokeWidth="2.5" fill="none"/>
    <line x1="8" y1="8" x2="16" y2="8" stroke="#8B7FF5" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="8" y1="12" x2="16" y2="12" stroke="#8B7FF5" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="8" y1="16" x2="13" y2="16" stroke="#8B7FF5" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

export const ParallelWorkflowIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="12" r="2.5" stroke="#2BB673" strokeWidth="2.5" fill="none"/>
    <circle cx="18" cy="6" r="2.5" stroke="#2BB673" strokeWidth="2.5" fill="none"/>
    <circle cx="18" cy="18" r="2.5" stroke="#2BB673" strokeWidth="2.5" fill="none"/>
    <path d="M8.5 12 L15.5 6" stroke="#2BB673" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M8.5 12 L15.5 18" stroke="#2BB673" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

export const AgentDecisionIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="12" height="12" rx="4" stroke="#22C7A9" strokeWidth="2.5" fill="none"/>
    <circle cx="10" cy="11" r="1.5" fill="#22C7A9"/>
    <circle cx="14" cy="11" r="1.5" fill="#22C7A9"/>
    <path d="M10 14 Q12 15.5 14 14" stroke="#22C7A9" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M12 3 L12 6" stroke="#22C7A9" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="12" cy="2" r="1" fill="#22C7A9"/>
  </svg>
)

export const APIIntegrationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="8" width="6" height="8" rx="2" stroke="#F59E0B" strokeWidth="2.5" fill="none"/>
    <line x1="17" y1="11" x2="17" y2="13" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M14 12 L10 12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="7" cy="12" r="2.5" stroke="#F59E0B" strokeWidth="2.5" fill="none"/>
    <line x1="4" y1="12" x2="2" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

// Export automation icons
export { ScheduledTaskIcon, EventTriggerIcon, WebhookIcon, QueueConsumerIcon } from './icons/automation-icons'
