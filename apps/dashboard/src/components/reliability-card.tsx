import React from 'react'

interface ReliabilityCardProps {
  className?: string
}

export function ReliabilityCard({ className = '' }: ReliabilityCardProps) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className={`border border-[#DED8D2] bg-white rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-[#111111] mb-4">Run Reliability</h3>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
          <span className="text-sm text-[#111111]">Protected against duplicate runs</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
          <span className="text-sm text-[#111111]">Safe state transitions</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
          <span className="text-sm text-[#111111]">Automatic recovery on interruption</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
          <span className="text-sm text-[#111111]">Repeatable results</span>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-[#EA580C] hover:text-[#C2410C] transition-colors"
      >
        {expanded ? '▼' : '▶'} How this works
      </button>

      {expanded && (
        <div className="mt-4 p-4 bg-[#FBF7F2] rounded-lg border border-[#DED8D2]">
          <p className="text-sm text-gray-700 mb-3">
            OpenRooms ensures reliable execution through several mechanisms:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><strong>Deterministic execution:</strong> Each run follows a predictable path with consistent outcomes</li>
            <li><strong>State validation:</strong> The system validates every state change to prevent invalid transitions</li>
            <li><strong>Append-only logs:</strong> Complete audit trail preserves every event for debugging and compliance</li>
            <li><strong>Automatic recovery:</strong> Interrupted runs resume safely without data loss or duplication</li>
          </ul>
        </div>
      )}
    </div>
  )
}
