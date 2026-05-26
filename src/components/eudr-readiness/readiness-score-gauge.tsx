'use client'

import { useEffect, useState } from 'react'

interface ReadinessScoreGaugeProps {
  score: number
  size?: number
  label?: string
}

function getColorInfo(score: number) {
  if (score <= 40) return { color: '#dc2626', label: 'Not Ready', bgClass: 'bg-red-50 dark:bg-red-950/30' }
  if (score <= 60) return { color: '#d97706', label: 'Needs Work', bgClass: 'bg-amber-50 dark:bg-amber-950/30' }
  if (score <= 80) return { color: '#0d9488', label: 'Mostly Ready', bgClass: 'bg-teal-50 dark:bg-teal-950/30' }
  return { color: '#16a34a', label: 'Ready', bgClass: 'bg-green-50 dark:bg-green-950/30' }
}

export function ReadinessScoreGauge({ score, size = 220, label }: ReadinessScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const colorInfo = getColorInfo(score)

  useEffect(() => {
    const duration = 1200
    const start = animatedScore
    const end = score
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(start + (end - start) * eased))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [score])

  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = Math.PI * radius // Half circle
  const progress = (animatedScore / 100) * circumference
  const startAngle = 180

  // Arc path for the gauge background (semi-circle)
  const arcPath = (r: number, startDeg: number, endDeg: number) => {
    const startRad = (startDeg * Math.PI) / 180
    const endRad = (endDeg * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
  }

  // Tick marks
  const ticks: { x1: number; y1: number; x2: number; y2: number; major: boolean; value: number }[] = []
  for (let i = 0; i <= 10; i++) {
    const angle = startAngle + (i * 180) / 10
    const rad = (angle * Math.PI) / 180
    const innerR = radius - strokeWidth / 2 - 6
    const outerR = radius - strokeWidth / 2 - (i % 5 === 0 ? 16 : 11)
    ticks.push({
      x1: cx + innerR * Math.cos(rad),
      y1: cy + innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy + outerR * Math.sin(rad),
      major: i % 5 === 0,
      value: i * 10,
    })
  }

  return (
    <div className={`flex flex-col items-center gap-2 p-6 rounded-2xl ${colorInfo.bgClass} transition-colors duration-500`}>
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.62}`}>
        {/* Background arc */}
        <path
          d={arcPath(radius, startAngle, 360)}
          fill="none"
          stroke="currentColor"
          className="text-muted/30"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <path
          d={arcPath(radius, startAngle, 360)}
          fill="none"
          stroke={colorInfo.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference - progress}`}
          className="transition-all duration-300"
          style={{ filter: `drop-shadow(0 0 6px ${colorInfo.color}40)` }}
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.major ? 'currentColor' : 'currentColor'}
            className={tick.major ? 'text-foreground/60' : 'text-foreground/25'}
            strokeWidth={tick.major ? 2 : 1}
          />
        ))}

        {/* Score text */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground font-mono"
          fontSize={size * 0.18}
          fontWeight="bold"
        >
          {animatedScore}
        </text>

        {/* Label */}
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={colorInfo.color}
          fontSize={size * 0.065}
          fontWeight="600"
        >
          {colorInfo.label}
        </text>

        {/* Min/Max labels */}
        <text
          x={cx - radius + 4}
          y={cy + 16}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={size * 0.05}
        >
          0
        </text>
        <text
          x={cx + radius - 4}
          y={cy + 16}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={size * 0.05}
        >
          100
        </text>
      </svg>
      {label && (
        <p className="text-sm font-medium text-muted-foreground mt-1">{label}</p>
      )}
    </div>
  )
}
