'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Plus, Calendar } from 'lucide-react'

type ResourceSkill = { id: string; skillName: string; proficiency: string }

type ResourceBooking = {
  id: string
  startDate: string
  endDate: string
  hours: number
  status: string
}

type Resource = {
  id: string
  resourceNo: string
  name: string
  type: string
  capacity: number
  isActive: boolean
  skills: ResourceSkill[]
  bookings: ResourceBooking[]
}

const PROFICIENCY_COLORS: Record<string, string> = {
  basic: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  intermediate: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  advanced: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  expert: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

function getUtilizationStatus(pct: number): { label: string; color: string; bar: string } {
  if (pct > 100) return { label: 'Overbooked', color: 'text-red-400', bar: 'bg-red-500' }
  if (pct >= 80) return { label: 'Allocated', color: 'text-amber-400', bar: 'bg-amber-500' }
  return { label: 'Available', color: 'text-emerald-400', bar: 'bg-emerald-500' }
}

// 4-week mini-calendar: 28 days from today
function get28Days(): Date[] {
  const days: Date[] = []
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  for (let i = 0; i < 28; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    days.push(d)
  }
  return days
}

function isDayBooked(day: Date, bookings: ResourceBooking[]): boolean {
  const t = day.getTime()
  return bookings.some(b => {
    const s = new Date(b.startDate).getTime()
    const e = new Date(b.endDate).getTime()
    return t >= s && t <= e
  })
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    fetch('/api/resources')
      .then(r => r.ok ? r.json() : [])
      .then((data: Resource[]) => setResources(data))
      .finally(() => setLoading(false))
  }, [])

  const days = get28Days()
  const weekLabels = ['W1', 'W2', 'W3', 'W4']

  // Utilization: total booked hours in next 28 days / (capacity * 28 days)
  function utilization(r: Resource): number {
    const now = new Date()
    const end28 = new Date(now)
    end28.setDate(now.getDate() + 28)
    const bookedHours = r.bookings
      .filter(b => {
        const bs = new Date(b.startDate)
        const be = new Date(b.endDate)
        return be >= now && bs <= end28
      })
      .reduce((s, b) => s + Number(b.hours), 0)
    const capacityHours = Number(r.capacity) * 20 // ~20 working days in 4 weeks
    return capacityHours > 0 ? Math.round((bookedHours / capacityHours) * 100) : 0
  }

  return (
    <>
      <TopBar title="Resource Management" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-500" />
            Resources ({resources.length})
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCalendar(v => !v)}
              className="text-xs gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              {showCalendar ? 'Hide Calendar' : 'Availability Calendar'}
            </Button>
            <Link href="/projects/resources/book">
              <Button size="sm" className="text-xs gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Book Resource
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-zinc-600">Loading resources…</div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16 text-xs text-zinc-600">No resources found.</div>
        ) : (
          <>
            {/* Resource Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {resources.map(r => {
                const pct = utilization(r)
                const status = getUtilizationStatus(pct)
                return (
                  <Link key={r.id} href={`/projects/resources/${r.id}`}>
                    <Card className="cursor-pointer hover:border-zinc-600 transition-colors h-full">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-100">{r.name}</p>
                            <p className="text-xs text-zinc-500 font-mono">{r.resourceNo}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                            <p className="text-xs text-zinc-600 capitalize">{r.type}</p>
                          </div>
                        </div>

                        {/* Utilization Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-zinc-500 mb-1">
                            <span>Utilization</span>
                            <span className={status.color}>{Math.min(pct, 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${status.bar}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Skills */}
                        {r.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {r.skills.slice(0, 4).map(sk => (
                              <span
                                key={sk.id}
                                className={`text-xs px-1.5 py-0.5 rounded border ${PROFICIENCY_COLORS[sk.proficiency] ?? 'bg-zinc-700/50 text-zinc-400 border-zinc-700'}`}
                              >
                                {sk.skillName}
                              </span>
                            ))}
                            {r.skills.length > 4 && (
                              <span className="text-xs text-zinc-600">+{r.skills.length - 4} more</span>
                            )}
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-zinc-600">{r.bookings.length} booking{r.bookings.length !== 1 ? 's' : ''}</span>
                          <span className="text-xs text-zinc-600">{r.capacity}h/day capacity</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {/* 4-Week Availability Calendar */}
            {showCalendar && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    4-Week Availability Calendar
                    <div className="ml-auto flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-sm bg-blue-500/70 inline-block" /> Booked
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-sm bg-emerald-500/30 inline-block" /> Free
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-zinc-500 font-medium border-b border-zinc-800 min-w-[160px]">Resource</th>
                        {weekLabels.map((wk, wi) => (
                          <th
                            key={wk}
                            colSpan={7}
                            className="py-2 text-center text-zinc-500 font-medium border-b border-zinc-800 border-l border-zinc-800"
                          >
                            {wk} — {days[wi * 7].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        <th className="px-4 py-1.5 border-b border-zinc-800" />
                        {days.map((d, di) => (
                          <th
                            key={di}
                            className={`py-1.5 text-center border-b border-zinc-800 ${di % 7 === 0 ? 'border-l border-zinc-800' : ''} ${d.getDay() === 0 || d.getDay() === 6 ? 'text-zinc-700' : 'text-zinc-500'}`}
                          >
                            {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map(r => (
                        <tr key={r.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/10">
                          <td className="px-4 py-2 text-zinc-300 font-medium">{r.name}</td>
                          {days.map((d, di) => {
                            const booked = isDayBooked(d, r.bookings)
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6
                            return (
                              <td
                                key={di}
                                className={`py-2 text-center ${di % 7 === 0 ? 'border-l border-zinc-800' : ''}`}
                              >
                                <span
                                  className={`inline-block w-5 h-5 rounded-sm text-[9px] leading-5 ${
                                    isWeekend
                                      ? 'bg-zinc-900 text-zinc-700'
                                      : booked
                                        ? 'bg-blue-500/70 text-blue-100'
                                        : 'bg-emerald-500/20 text-emerald-600'
                                  }`}
                                >
                                  {d.getDate()}
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </>
  )
}
