// Automation Icons for OpenRooms
// Designed to match the exact style of homepage icons
// Represents AI agent orchestration concepts

// Scheduled Task - Timeline with trigger points and tiny bot
export const ScheduledTaskIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Timeline bar */}
    <line x1="4" y1="12" x2="20" y2="12" stroke="#4A90E2" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Trigger points */}
    <circle cx="7" cy="12" r="2" fill="#4A90E2"/>
    <circle cx="12" cy="12" r="2" fill="#4A90E2"/>
    <circle cx="17" cy="12" r="2" fill="#4A90E2"/>
    {/* Tiny bot indicator above timeline */}
    <rect x="10" y="4" width="4" height="4" rx="1" stroke="#4A90E2" strokeWidth="2" fill="none"/>
    <circle cx="11" cy="5.5" r="0.5" fill="#4A90E2"/>
    <circle cx="13" cy="5.5" r="0.5" fill="#4A90E2"/>
    {/* Connection to timeline */}
    <line x1="12" y1="8" x2="12" y2="10" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// Event Trigger - Signal wave entering a node
export const EventTriggerIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Signal wave */}
    <path d="M2 12 L5 8 L8 16 L11 4 L14 12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Arrow indicating flow */}
    <path d="M14 12 L17 12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M15 10 L17 12 L15 14" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Target node */}
    <circle cx="20" cy="12" r="2.5" stroke="#F59E0B" strokeWidth="2.5" fill="none"/>
    <circle cx="20" cy="12" r="1" fill="#F59E0B"/>
  </svg>
)

// Webhook - External node sending packet into room/container
export const WebhookIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* External node (source) */}
    <circle cx="5" cy="12" r="2.5" stroke="#2BB673" strokeWidth="2.5" fill="none"/>
    <circle cx="5" cy="12" r="1" fill="#2BB673"/>
    {/* Data packet */}
    <rect x="10" y="10" width="3" height="3" rx="0.5" fill="#2BB673" opacity="0.6"/>
    {/* Connection line */}
    <path d="M7.5 12 L10 12" stroke="#2BB673" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 2"/>
    <path d="M13 11.5 L15 11.5" stroke="#2BB673" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 2"/>
    {/* Room/container (target) */}
    <rect x="16" y="7" width="6" height="10" rx="2" stroke="#2BB673" strokeWidth="2.5" fill="none"/>
    <circle cx="18" cy="10" r="0.8" fill="#2BB673"/>
    <circle cx="20" cy="10" r="0.8" fill="#2BB673"/>
    <line x1="18" y1="13" x2="20" y2="13" stroke="#2BB673" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// Queue Consumer - Bot consuming stacked message blocks
export const QueueConsumerIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stacked message blocks (queue) */}
    <rect x="3" y="14" width="9" height="3" rx="1" stroke="#22C7A9" strokeWidth="2" fill="none"/>
    <rect x="3" y="10" width="9" height="3" rx="1" stroke="#22C7A9" strokeWidth="2" fill="none" opacity="0.6"/>
    <rect x="3" y="6" width="9" height="3" rx="1" stroke="#22C7A9" strokeWidth="2" fill="none" opacity="0.3"/>
    {/* Arrow showing consumption */}
    <path d="M12 15.5 L15 15.5" stroke="#22C7A9" strokeWidth="2" strokeLinecap="round"/>
    <path d="M13.5 14 L15 15.5 L13.5 17" stroke="#22C7A9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Bot consuming */}
    <rect x="16" y="12" width="6" height="7" rx="2" stroke="#22C7A9" strokeWidth="2.5" fill="none"/>
    <circle cx="18" cy="15" r="0.8" fill="#22C7A9"/>
    <circle cx="20" cy="15" r="0.8" fill="#22C7A9"/>
    <path d="M18 17.5 Q19 18.5 20 17.5" stroke="#22C7A9" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
)
