import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, ClipboardList } from 'lucide-react'

export const dynamic = 'force-dynamic'

const TYPE_COLORS: Record<string, string> = {
  survey: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  assessment: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  onboarding: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  exit: 'bg-red-500/20 text-red-400 border border-red-500/30',
  performance: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700/50 text-zinc-400 border border-zinc-700/40',
  active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  closed: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

export default async function QuestionnairesPage() {
  const now = new Date()
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const questionnaires = await prisma.questionnaire.findMany({
    include: { responses: true },
    orderBy: { createdAt: 'desc' },
  })

  const active = questionnaires.filter(q => q.status === 'active').length
  const totalResponses = questionnaires.reduce((s, q) => s + q.responses.length, 0)
  const dueThisWeek = questionnaires.filter(
    q => q.dueDate && new Date(q.dueDate) >= now && new Date(q.dueDate) <= weekEnd
  ).length

  // Avg completion rate (responses / active questionnaires, rough proxy)
  const avgCompletion = active > 0
    ? Math.round(questionnaires.filter(q => q.status === 'active').reduce((s, q) => s + q.responses.length, 0) / active)
    : 0

  return (
    <>
      <TopBar title="Questionnaires" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Questionnaires</h1>
            <p className="text-[13px] text-zinc-500">Surveys, assessments, onboarding, exit, and performance forms</p>
          </div>
          <Link
            href="/hr/questionnaires/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Questionnaire
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Active Surveys', value: active, color: 'text-emerald-400' },
            { label: 'Total Responses', value: totalResponses, color: 'text-blue-400' },
            { label: 'Avg Responses / Active', value: avgCompletion, color: 'text-purple-400' },
            { label: 'Due This Week', value: dueThisWeek, color: dueThisWeek > 0 ? 'text-amber-400' : 'text-zinc-100' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Questionnaires table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50">
            <h2 className="text-[15px] font-semibold text-zinc-100">All Questionnaires</h2>
          </div>
          {questionnaires.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-zinc-500">
              <ClipboardList className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No questionnaires yet</p>
              <Link href="/hr/questionnaires/new" className="mt-2 text-[13px] text-blue-400 hover:underline">
                Create your first questionnaire
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Title</th>
                    <th className="text-left px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Type</th>
                    <th className="text-center px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                    <th className="text-right px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Responses</th>
                    <th className="text-center px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Anonymous</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {questionnaires.map(q => (
                    <tr key={q.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2.5">
                        <Link href={`/hr/questionnaires/${q.id}`} className="font-medium text-zinc-200 hover:text-blue-400 transition-colors">
                          {q.title}
                        </Link>
                        {q.description && (
                          <p className="text-[11px] text-zinc-500 truncate max-w-xs">{q.description}</p>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${TYPE_COLORS[q.type] ?? 'bg-zinc-700 text-zinc-300'}`}>
                          {q.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${STATUS_COLORS[q.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-zinc-200">{q.responses.length}</td>
                      <td className="px-3 py-2.5 text-center text-zinc-500">
                        {q.anonymous ? <span className="text-purple-400">Yes</span> : '—'}
                      </td>
                      <td className="px-5 py-2.5 text-zinc-500">
                        {q.dueDate
                          ? <span className={new Date(q.dueDate) < now ? 'text-red-400' : ''}>
                              {new Date(q.dueDate).toLocaleDateString()}
                            </span>
                          : <span className="text-zinc-600 italic">No due date</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </>
  )
}
