import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Users, BarChart3, CheckCircle } from 'lucide-react'

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

const QTYPE_LABELS: Record<string, string> = {
  text: 'Text',
  rating: 'Rating',
  multiple_choice: 'Multiple Choice',
  yes_no: 'Yes / No',
}

export default async function QuestionnaireDetailPage({ params }: { params: { id: string } }) {
  const questionnaire = await prisma.questionnaire.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { sortOrder: 'asc' } },
      responses: {
        include: {
          employee: { select: { firstName: true, lastName: true } },
          answers: true,
        },
        orderBy: { submittedAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!questionnaire) notFound()

  const totalResponses = questionnaire.responses.length
  const responseRate = questionnaire.status === 'active' ? totalResponses : null

  return (
    <>
      <TopBar title={questionnaire.title} />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Back */}
        <Link
          href="/hr/questionnaires"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Questionnaires
        </Link>

        {/* Header card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-[18px] font-semibold text-zinc-100">{questionnaire.title}</h1>
              {questionnaire.description && (
                <p className="text-[13px] text-zinc-400">{questionnaire.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${TYPE_COLORS[questionnaire.type] ?? 'bg-zinc-700 text-zinc-300'}`}>
                  {questionnaire.type}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${STATUS_COLORS[questionnaire.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                  {questionnaire.status}
                </span>
                {questionnaire.anonymous && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Anonymous
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              {questionnaire.dueDate && (
                <p className="text-[12px] text-zinc-500">
                  Due: <span className="text-zinc-300">{new Date(questionnaire.dueDate).toLocaleDateString()}</span>
                </p>
              )}
              <p className="text-[12px] text-zinc-500 mt-1">
                Created: <span className="text-zinc-400">{new Date(questionnaire.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-zinc-800/50">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">Questions</p>
              <p className="text-xl font-bold text-zinc-100">{questionnaire.questions.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">Total Responses</p>
              <p className="text-xl font-bold text-blue-400">{totalResponses}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">Avg Answers / Response</p>
              <p className="text-xl font-bold text-purple-400">
                {totalResponses > 0
                  ? (questionnaire.responses.reduce((s, r) => s + r.answers.length, 0) / totalResponses).toFixed(1)
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Response rate chart placeholder */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <p className="text-[15px] font-semibold text-zinc-100">Response Rate</p>
          </div>
          <div className="h-20 flex items-center justify-center rounded-lg bg-zinc-900/50 border border-zinc-800/40">
            <p className="text-[12px] text-zinc-600">Response rate chart — wire to analytics engine</p>
          </div>
        </div>

        {/* Questions list */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50">
            <h2 className="text-[15px] font-semibold text-zinc-100">Questions ({questionnaire.questions.length})</h2>
          </div>
          {questionnaire.questions.length === 0 ? (
            <div className="py-10 text-center text-zinc-600 text-[13px]">No questions added</div>
          ) : (
            <div className="divide-y divide-zinc-800/40">
              {questionnaire.questions.map((q, idx) => (
                <div key={q.id} className="px-5 py-3 flex items-start gap-3">
                  <span className="mt-0.5 text-[11px] font-mono text-zinc-600 w-6 shrink-0">{idx + 1}.</span>
                  <div className="flex-1">
                    <p className="text-[13px] text-zinc-200">{q.questionText}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-zinc-500">{QTYPE_LABELS[q.questionType] ?? q.questionType}</span>
                      {q.required && (
                        <span className="text-[10px] text-amber-400/80">Required</span>
                      )}
                      {q.optionsJson && (
                        <span className="text-[10px] text-zinc-500">
                          {(JSON.parse(q.optionsJson) as string[]).join(' · ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Responses */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <h2 className="text-[15px] font-semibold text-zinc-100">Recent Responses</h2>
            <span className="ml-auto text-[12px] text-zinc-500">{totalResponses} total</span>
          </div>
          {questionnaire.responses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <CheckCircle className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No responses yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Respondent</th>
                    <th className="text-right px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Answers</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {questionnaire.responses.map(r => (
                    <tr key={r.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2.5 text-zinc-200 font-medium">
                        {questionnaire.anonymous
                          ? <span className="text-zinc-500 italic">Anonymous</span>
                          : r.employee
                            ? `${r.employee.lastName}, ${r.employee.firstName}`
                            : <span className="text-zinc-500">Unknown</span>
                        }
                      </td>
                      <td className="px-3 py-2.5 text-right text-zinc-300 font-semibold">{r.answers.length}</td>
                      <td className="px-5 py-2.5 text-zinc-500">
                        {new Date(r.submittedAt).toLocaleDateString()}
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
