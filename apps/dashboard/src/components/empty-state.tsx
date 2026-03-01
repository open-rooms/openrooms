'use client'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="relative mb-6">
        {icon || (
          <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      
      <h3 className="text-xl font-black text-gray-900 mb-2 tracking-wide">
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 mb-6 max-w-sm">
        {description}
      </p>
      
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F54E00] text-white font-medium rounded-md hover:bg-[#E24600] active:bg-[#D03D00] transition-colors duration-120 ease-in-out"
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F54E00] text-white font-medium rounded-md hover:bg-[#E24600] active:bg-[#D03D00] transition-colors duration-120 ease-in-out"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}

export function RoomEmptyState() {
  return (
    <EmptyState
      icon={
        <svg className="w-24 h-24 text-[#FF9999]" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
          <path d="M8 14 Q12 16 16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      }
      title="No rooms yet"
      description="Create your first room to start executing workflows and managing agents."
      action={{ label: "Create Room", href: "/rooms/new" }}
    />
  )
}

export function WorkflowEmptyState() {
  return (
    <EmptyState
      icon={
        <svg className="w-24 h-24 text-yellow-500" viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="12" r="2" fill="currentColor"/>
          <circle cx="18" cy="12" r="2" fill="currentColor"/>
          <circle cx="12" cy="6" r="2" fill="currentColor"/>
          <circle cx="12" cy="18" r="2" fill="currentColor"/>
          <path d="M8 12 L16 12 M12 8 L12 10 M12 14 L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      }
      title="No workflows configured"
      description="Define workflows to orchestrate agent behavior and execution flows."
      action={{ label: "Create Workflow", href: "/workflows/new" }}
    />
  )
}

export function LogEmptyState() {
  return (
    <EmptyState
      icon={
        <svg className="w-24 h-24 text-gray-500" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      }
      title="No logs found"
      description="When rooms execute, their logs will appear here."
    />
  )
}
