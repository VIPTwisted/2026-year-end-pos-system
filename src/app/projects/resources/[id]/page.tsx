'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, BookOpen, Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type ResourceSkill = { id: string; skillName: string; proficiency: string }

type Booking = {
  id: string
  projectId: string | null
  startDate: string
  endDate: string
  hours: number
  status: string
  notes: string | null
  createdAt: string
}

type Resource = {
  id: string
  resourceNo: string
  name: string
  type: string
  unitOfMeasure: string
  unitCost: number
  unitPrice: number
  capacity: number
  isActive: boolean
  notes: string | null
  skills: ResourceSkill[]
  bookings: Booking[]
  createdAt: string
}

const PROFICIENCY_COLORS: Record<string, string> = {
  basic: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  intermediate: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  advanced: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  expert: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

function calcUtilizationMonths(bookings: Booking[]): { label: string; pct: number }[] {
  const result: { label: string; pct: number }[] = []
  const now = new Date()
  for (let m = -1; m <= 2; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() + m, 1)
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const workingDays = 20 // approximate
    const bookedHours = bookings
      .filter(b => {
        const bs = new Date(b.startDate)
        const be = new Date(b.endDate)
        return be >= monthStart && bs <= monthEnd
      })
      .reduce((s, b) => s + Number(b.hours), 0)
    const cap = workingDays * 8
    result.push({ label, pct: Math.min(150, Math.round((bookedHours / cap) * 100)) })
  }
  return result
}

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>()
  const resourceId = params.id

  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/resources/${resourceId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setResource(data))
      .finally(() => setLoading(false))
  }, [resourceId])

  if (loading) {
    return (
      <>
        <TopBar title="Resource Detail" />
        <main className="flex-1 p-6"><p className="text-xs text-zinc-600">Loading…</p></main>
      </>
    )
  }
  if (!resource) {
    return (
      <>
        <TopBar title="Resource Not Found" />
        <main className="flex-1 p-6">
          <p className="text-xs text-red-400">Resource not found.</p>
          <Link href="/projects/resources" className="text-xs text-blue-400 hover:underline mt-2 block">← Back</Link>
        </main>
      </>
    )
  }

  const totalBookedHours = resource.bookings.reduce((s, b) => s + Number(b.hours), 0)
  const utilizationMonths = calcUtilizationMonths(resource.bookings)

  const sortedBookings = [...resource.bookings].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  )

  return (
    <>
      <TopBar title={resource.name} />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        <Link href="/projects/resources" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Resources
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Users className="w-5 h-5 text-zinc-500" />
                  <span className="text-xl font-bold text-zinc-100">{resource.name}</span>
                  <Badge variant={resource.isActive ? 'success' : 'secondary'} className="text-xs">
                    {resource.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 font-mono mb-3">{resource.resourceNo} · {resource.type} · {resource.unitOfMeasure}</p>
                <div className="grid grid-cols-3 gap-6 text-xs">
                  <div><p className="text-zinc-500 uppercase tracking-wide mb-0.5">Cost Rate</p><p className="text-zinc-200 font-semibold">${Number(resource.unitCost).toFixed(2)}/h</p></div>
                  <div><p className="text-zinc-500 uppercase tracking-wide mb-0.5">Bill Rate</p><p className="text-zinc-200 font-semibold">${Number(resource.unitPrice).toFixed(2)}/h</p></div>
                  <div><p className="text-zinc-500 uppercase tracking-wide mb-0.5">Capacity</p><p className="text-zinc-200 font-semibold">{resource.capacity}h/day</p></div>
                </div>
              </div>
              <Link href="/projects/resources/book">
                <Button size="sm" className="text-xs shrink-0">
                  <BookOpen className="w-3.5 h-3.5 mr-1" />
                  Book
                </Button>
              </Link>
            </div>
            {resource.notes && (
              <p className="mt-3 text-xs text-zinc-500 border-t border-zinc-800 pt-3">{resource.notes}</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: Skills + Utilization Chart */}
          <div className="space-y-4">
            {/* Skills */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-zinc-400" />
                  Skills ({resource.skills.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resource.skills.length === 0 ? (
                  <p className="text-xs text-zinc-600">No skills recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {resource.skills.map(sk => (
                      <div key={sk.id} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-200">{sk.skillName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${PROFICIENCY_COLORS[sk.proficiency] ?? 'bg-zinc-700/50 text-zinc-400 border-zinc-700'}`}>
                          {sk.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Utilization Chart (bar chart by month) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Utilization by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {utilizationMonths.map(({ label, pct }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-zinc-500 mb-1">
                        <span>{label}</span>
                        <span className={pct > 100 ? 'text-red-400' : pct >= 80 ? 'text-amber-400' : 'text-emerald-400'}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct > 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between text-xs">
                  <span className="text-zinc-500">Total booked</span>
                  <span className="text-zinc-200 font-semibold">{totalBookedHours.toFixed(1)}h</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Bookings Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-zinc-400" />
                  Bookings Timeline ({resource.bookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {sortedBookings.length === 0 ? (
                  <p className="px-4 pb-4 pt-2 text-xs text-zinc-600">No bookings yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {['Start', 'End', 'Hours', 'Status', 'Notes'].map(h => (
                          <th key={h} className={`px-4 pb-2 pt-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Notes' ? 'text-left' : 'text-right'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBookings.map(b => {
                        const now = new Date()
                        const start = new Date(b.startDate)
                        const end = new Date(b.endDate)
                        const isActive = start <= now && end >= now
                        const isPast = end < now
                        return (
                          <tr key={b.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                            <td className={`px-4 py-2.5 text-right text-xs ${isPast ? 'text-zinc-600' : isActive ? 'text-emerald-400' : 'text-zinc-300'}`}>
                              {formatDate(b.startDate).split(',')[0]}
                            </td>
                            <td className={`px-4 py-2.5 text-right text-xs ${isPast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                              {formatDate(b.endDate).split(',')[0]}
                            </td>
                            <td className="px-4 py-2.5 text-right text-xs text-zinc-300 font-semibold">
                              {Number(b.hours).toFixed(1)}h
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <Badge
                                variant={b.status === 'hard' ? 'default' : 'secondary'}
                                className="text-xs capitalize"
                              >
                                {b.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-2.5 text-xs text-zinc-500 max-w-[200px] truncate">
                              {b.notes ?? '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
