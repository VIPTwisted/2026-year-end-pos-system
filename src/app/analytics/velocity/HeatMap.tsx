'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

interface VelocityDataPoint {
  label: string
  revenue: number
  orders: number
}

interface TooltipState {
  x: number
  y: number
  point: VelocityDataPoint
}

interface VelocityChartProps {
  data: VelocityDataPoint[]
  title?: string
}

export function VelocityChart({ data, title }: VelocityChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)
  const maxOrders = Math.max(...data.map(d => d.orders), 1)

  function barColor(pct: number): string {
    if (pct >= 0.8) return 'bg-emerald-500'
    if (pct >= 0.4) return 'bg-blue-500'
    return 'bg-zinc-600'
  }

  function barBg(pct: number): string {
    if (pct >= 0.8) return 'bg-emerald-500/20'
    if (pct >= 0.4) return 'bg-blue-500/20'
    return 'bg-zinc-600/20'
  }

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>, point: VelocityDataPoint) {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      point,
    })
  }

  return (
    <div className="space-y-1">
      {title && (
        <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
          {title}
        </div>
      )}

      {data.map((point) => {
        const revPct = point.revenue / maxRevenue
        const barW = Math.max(revPct * 100, point.revenue > 0 ? 1 : 0)

        return (
          <div
            key={point.label}
            className="flex items-center gap-3 group cursor-default"
            onMouseEnter={(e) => handleMouseEnter(e, point)}
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Label */}
            <div className="w-14 text-right text-[11px] text-zinc-400 font-medium shrink-0">
              {point.label}
            </div>

            {/* Bar track */}
            <div className="flex-1 relative h-6 flex items-center">
              <div className={`absolute inset-0 rounded-sm ${barBg(revPct)}`} />
              <div
                className={`h-4 rounded-sm transition-all duration-300 ${barColor(revPct)}`}
                style={{ width: `${barW}%` }}
              />
            </div>

            {/* Revenue */}
            <div className="w-20 text-right text-[11px] font-semibold text-zinc-200 tabular-nums shrink-0">
              {formatCurrency(point.revenue)}
            </div>

            {/* Orders */}
            <div className="w-14 text-right text-[11px] text-zinc-500 tabular-nums shrink-0">
              {point.orders === 1 ? '1 order' : `${point.orders} orders`}
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-3 border-t border-zinc-800/50 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-[10px] text-zinc-500">Peak (&ge;80%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span className="text-[10px] text-zinc-500">Active (&ge;40%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-zinc-600" />
          <span className="text-[10px] text-zinc-500">Slow (&lt;40%)</span>
        </div>
        <div className="ml-auto text-[10px] text-zinc-600">% of max: {formatCurrency(Math.max(...data.map(d => d.revenue), 0))}</div>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl text-left min-w-[140px]">
            <div className="text-[11px] font-semibold text-zinc-100 mb-1">{tooltip.point.label}</div>
            <div className="text-[11px] text-emerald-400 tabular-nums">
              {formatCurrency(tooltip.point.revenue)} revenue
            </div>
            <div className="text-[11px] text-zinc-400 tabular-nums">
              {tooltip.point.orders} {tooltip.point.orders === 1 ? 'order' : 'orders'}
            </div>
            {tooltip.point.orders > 0 && (
              <div className="text-[11px] text-zinc-500 tabular-nums">
                avg {formatCurrency(tooltip.point.revenue / tooltip.point.orders)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
