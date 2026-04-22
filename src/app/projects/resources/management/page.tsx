'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Users, Plus, Edit2, BookOpen, Calendar, Download, ChevronRight } from 'lucide-react'

type Resource = {
  id: string
  resourceNo: string
  name: string
  type: string
  role: string
  department: string
  availableHours: number
  bookedHours: number
  utilizationPct: number
  skills: string[]
}

function utilizationColor(pct: number) {
  if (pct > 95) return { text: 'text-red-400', bg: 'bg-red-500', badge: 'bg-red-500/15 text-red-400 border-red-500/30' }
  if (pct >= 80) return { text: 'text-amber-400', bg: 'bg-amber-500', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' }
  return { text: 'text-emerald-400', bg: 'bg-emerald-500', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' }
}

const TYPE_COLORS: Record<string, string> = {
  Human: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Machine: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Material: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Facility: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
}

export default function ResourceManagementPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects/resources/management')
      .then(r => r.ok ? r.json() : [])
      .then(setResources)
      .finally(() => setLoading(false))
  }, [])

  const totalResources = resources.length
  const avgUtil = resources.length ? Math.round(resources.reduce((s, r) => s + r.utilizationPct, 0) / resources.length) : 0
  const overbooked = resources.filter(r => r.utilizationPct > 95).length
  const availableNow = resources.filter(r => r.utilizationPct < 80).length

  return (
    <>
      <TopBar title="Resource Management" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Link href="/projects" className="hover:text-zinc-300 transition-colors">Projects</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/projects/resources" className="hover:text-zinc-300 transition-colors">Resources</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">Resource Management</span>
        </nav>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add resource
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
            <BookOpen className="w-3.5 h-3.5" /> Book
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
            <Calendar className="w-3.5 h-3.5" /> View calendar
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors ml-auto">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Resources', value: totalResources, sub: 'All types' },
            { label: 'Avg Utilization', value: `${avgUtil}%`, sub: 'This month', valueClass: utilizationColor(avgUtil).text },
            { label: 'Overbooked', value: overbooked, sub: '>95% utilized', valueClass: overbooked > 0 ? 'text-red-400' : 'text-emerald-400' },
            { label: 'Available Now', value: availableNow, sub: '<80% utilized', valueClass: 'text-emerald-400' },
          ].map(k => (
            <div key={k.label} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <p className="text-[11px] text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.valueClass ?? 'text-zinc-100'}`}>{k.value}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Utilization Chart — pure SVG horizontal bars */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Utilization Overview</h3>
          {loading ? (
            <div className="text-center py-8 text-xs text-zinc-600">Loading…</div>
          ) : (
            <svg width="100%" viewBox={`0 0 700 ${resources.length * 36 + 20}`} className="font-mono">
              {resources.map((r, i) => {
                const y = i * 36 + 10
                const clampedPct = Math.min(r.utilizationPct, 100)
                const barW = Math.round((clampedPct / 100) * 460)
                const bookedW = Math.round((r.bookedHours / r.availableHours) * 460)
                const c = utilizationColor(r.utilizationPct)
                const fillColor = r.utilizationPct > 95 ? '#ef4444' : r.utilizationPct >= 80 ? '#f59e0b' : '#10b981'
                return (
                  <g key={r.id}>
                    {/* Name */}
                    <text x="0" y={y + 14} fontSize="11" fill="#94a3b8">{r.name}</text>
                    {/* Available track */}
                    <rect x="180" y={y + 4} width="460" height="16" rx="4" fill="#27272a" />
                    {/* Booked bar */}
                    <rect x="180" y={y + 4} width={Math.min(bookedW, 460)} height="16" rx="4" fill={fillColor} opacity="0.75" />
                    {/* Pct label */}
                    <text x={180 + Math.min(bookedW, 460) + 6} y={y + 15} fontSize="10" fill={fillColor}>{r.utilizationPct}%</text>
                    {/* Hours */}
                    <text x="650" y={y + 15} fontSize="10" fill="#52525b" textAnchor="end">{r.bookedHours}h / {r.availableHours}h</text>
                  </g>
                )
              })}
            </svg>
          )}
        </div>

        {/* Resource Table */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Resource List</h3>
          </div>
          {loading ? (
            <div className="text-center py-12 text-xs text-zinc-600">Loading resources…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Resource #', 'Name', 'Type', 'Role', 'Department', 'Utilization %', 'Available Hrs', 'Booked Hrs', 'Skills'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r, idx) => {
                    const c = utilizationColor(r.utilizationPct)
                    return (
                      <tr key={r.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-zinc-800/10'}`}>
                        <td className="px-4 py-3 font-mono text-zinc-500">{r.resourceNo}</td>
                        <td className="px-4 py-3 text-zinc-100 font-medium">{r.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] border ${TYPE_COLORS[r.type] ?? 'bg-zinc-700/30 text-zinc-400 border-zinc-700'}`}>{r.type}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">{r.role}</td>
                        <td className="px-4 py-3 text-zinc-400">{r.department}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${c.bg}`} style={{ width: `${Math.min(r.utilizationPct, 100)}%` }} />
                            </div>
                            <span className={`font-semibold ${c.text}`}>{r.utilizationPct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">{r.availableHours}h</td>
                        <td className="px-4 py-3 text-zinc-400">{r.bookedHours}h</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {r.skills.map(s => (
                              <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">{s}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
