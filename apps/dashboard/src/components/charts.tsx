'use client'

interface MiniChartProps {
  data: number[]
  color?: string
  height?: number
}

export function MiniLineChart({ data, color = '#FF9999', height = 40 }: MiniChartProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg 
      width="100%" 
      height={height} 
      className="overflow-visible"
      preserveAspectRatio="none"
    >
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      
      {/* Area under line */}
      <polygon
        points={`0,${height} ${points} 100,${height}`}
        fill={`url(#gradient-${color})`}
      />
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Dots on hover */}
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100
        const y = height - ((value - min) / range) * height
        return (
          <circle
            key={index}
            cx={`${x}%`}
            cy={y}
            r="3"
            fill={color}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )
      })}
    </svg>
  )
}

export function MiniBarChart({ data, color = '#FF9999', height = 40 }: MiniChartProps) {
  const max = Math.max(...data)
  const barWidth = 100 / data.length
  
  return (
    <svg width="100%" height={height} className="overflow-visible">
      {data.map((value, index) => {
        const barHeight = (value / max) * height
        const x = index * barWidth
        const y = height - barHeight
        
        return (
          <rect
            key={index}
            x={`${x}%`}
            y={y}
            width={`${barWidth * 0.8}%`}
            height={barHeight}
            fill={color}
            opacity="0.7"
            rx="2"
            className="hover:opacity-100 transition-opacity"
          />
        )
      })}
    </svg>
  )
}

interface SparklineProps {
  value: number
  max: number
  color?: string
}

export function Sparkline({ value, max, color = '#FF9999' }: SparklineProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden">
      <div 
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
        style={{
          width: `${percentage}%`,
          background: `linear-gradient(to right, ${color}, ${color}CC)`,
          boxShadow: `0 0 10px ${color}80`
        }}
      />
    </div>
  )
}
