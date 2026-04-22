export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Video, Phone, Users, MapPin } from 'lucide-react'

// TODO: add Interview model to schema with fields:
//   id, candidateName, candidateEmail, positionId, positionTitle,
//   interviewerId, interviewerName, scheduledAt, format, status, notes

type Interview = {
  id: string
  candidateName: string
  positionTitle: string
  interviewerName: string
  scheduledAt: string
  format: 'in-person' | 'video' | 'phone'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
}

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  'in-person': <MapPin className="w-3.5 h-3.5" />,
  'video':     <Video className="w-3.5 h-3.5" />,
  'phone':     <Phone className="w-3.5 h-3.5" />,
}

const FORMAT_COLORS: Record<string, string> = {
  'in-person': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'video':     'bg-purple-500/15 text-purple-400 border-purple-500/20',
  'phone':     'bg-zinc-700/40 text-zinc-400 border-zinc-700/40',
}

const STATUS_COLORS: Record<string, string> = {
  scheduled:  'bg-amber-500/15 text-amber-400',
  completed:  'bg-emerald-500/15 text-emerald-400',
  cancelled:  'bg-zinc-700/40 text-zinc-500',
  'no-show':  'bg-red-500/15 text-red-400',
}

const MOCK_INTERVIEWS: Interview[] = [
  {
    id: 'int-1',
    candidateName: 'Marcus Thompson',
    positionTitle: 'Senior Retail Associate',
    interviewerName: 'Jessica Moore',
    scheduledAt: '2026-04-23T10:00:00',
    format: 'video',
    status: 'scheduled',
  },
  {
    id: 'int-2',
    candidateName: 'Priya Sharma',
    positionTitle: 'Senior Retail Associate',
    interviewerName: 'Jessica Moore',
    scheduledAt: '2026-04-23T14:00:00',
    format: 'video',
    status: 'scheduled',
  },
  {
    id: 'int-3',
    candidateName: 'Raymond Castillo',
    positionTitle: 'POS Systems Analyst',
    interviewerName: 'Derek Park',
    scheduledAt: '2026-04-22T11:00:00',
    format: 'in-person',
    status: 'completed',
    notes: 'Strong technical background. Recommend for final round.',
  },
  {
    id: 'int-4',
    candidateName: 'Elena Foster',
    positionTitle: 'HR Coordinator',
    interviewerName: 'Tanya Williams',
    scheduledAt: '2026-04-24T09:30:00',
    format: 'phone',
    status: 'scheduled',
  },
  {
    id: 'int-5',
    candidateName: 'Tom Walsh',
    positionTitle: 'Senior Retail Associate',
    interviewerName: 'Jessica Moore',
    scheduledAt: '2026-04-21T13:00:00',
    format: 'video',
    status: 'cancelled',
  },
]

function formatScheduledAt(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  }
}

export default function InterviewSchedulePage() {
  const interviews = MOCK_INTERVIEWS

  const scheduled  = interviews.filter(i => i.status === 'scheduled').length
  const completed  = interviews.filter(i => i.status === 'completed').length
  const cancelled  = interviews.filter(i => i.status === 'cancelled').length

  // Group by date
  const byDate = interviews.reduce<Record<string, Interview[]>>((acc, i) => {
    const dateKey = new Date(i.scheduledAt).toDateString()
    ;(acc[dateKey] ??= []).push(i)
    return acc
  }, {})

  const sortedDates = Object.keys(byDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  )

  return (
    <>
      <TopBar title="Interview Schedule" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div>
          <Link href="/hr/recruiting" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-100 mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Recruiting
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-semibold text-zinc-100">Interview Schedule</h1>
              <p className="text-[13px] text-zinc-500">{interviews.length} interviews across all open positions</p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Scheduled', value: scheduled, color: 'text-amber-400' },
            { label: 'Completed', value: completed, color: 'text-emerald-400' },
            { label: 'Cancelled', value: cancelled, color: 'text-zinc-500' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Interviews grouped by date */}
        <div className="space-y-5">
          {sortedDates.map(dateKey => {
            const dayInterviews = byDate[dateKey].sort(
              (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
            )
            const d = new Date(dateKey)
            const isToday = d.toDateString() === new Date().toDateString()
            return (
              <div key={dateKey}>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">
                    {d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  {isToday && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-600 text-white font-semibold uppercase tracking-wide">Today</span>
                  )}
                </div>
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-zinc-800/50">
                        <th className="text-left px-5 pb-2.5 pt-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Time</th>
                        <th className="text-left px-3 pb-2.5 pt-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Candidate</th>
                        <th className="text-left px-3 pb-2.5 pt-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Position</th>
                        <th className="text-left px-3 pb-2.5 pt-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Interviewer</th>
                        <th className="text-center px-3 pb-2.5 pt-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Format</th>
                        <th className="text-center px-3 pb-2.5 pt-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                        <th className="text-left px-5 pb-2.5 pt-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayInterviews.map(i => {
                        const { time } = formatScheduledAt(i.scheduledAt)
                        return (
                          <tr key={i.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                            <td className="px-5 py-2.5 font-mono text-[12px] text-zinc-300">{time}</td>
                            <td className="px-3 py-2.5 font-medium text-zinc-100">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                                  <Users className="w-3 h-3 text-zinc-400" />
                                </div>
                                {i.candidateName}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-zinc-400">{i.positionTitle}</td>
                            <td className="px-3 py-2.5 text-zinc-400">{i.interviewerName}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border font-medium capitalize ${FORMAT_COLORS[i.format]}`}>
                                {FORMAT_ICONS[i.format]}
                                {i.format}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_COLORS[i.status]}`}>
                                {i.status}
                              </span>
                            </td>
                            <td className="px-5 py-2.5 text-[12px] text-zinc-500 max-w-[200px] truncate">
                              {i.notes ?? '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>

      </main>
    </>
  )
}
