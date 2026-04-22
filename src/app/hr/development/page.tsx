import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Target, BookOpen, GraduationCap, TrendingUp } from 'lucide-react'

// Goals: TODO — add EmployeeGoal model to schema
// Journals: TODO — add PerformanceJournal model to schema
// Courses: uses existing TrainingCourse + TrainingEnrollment models

type MockGoal = {
  id: string
  employeeName: string
  title: string
  category: string
  dueDate: string
  progress: number
  status: 'on-track' | 'at-risk' | 'overdue' | 'completed'
}

const STATUS_COLORS: Record<string, string> = {
  'on-track':  'bg-emerald-500/15 text-emerald-400',
  'at-risk':   'bg-amber-500/15 text-amber-400',
  'overdue':   'bg-red-500/15 text-red-400',
  'completed': 'bg-blue-500/15 text-blue-400',
}

const MOCK_GOALS: MockGoal[] = [
  { id: 'g1', employeeName: 'Jessica Moore', title: 'Complete POS Certification', category: 'Learning', dueDate: '2026-06-30', progress: 65, status: 'on-track' },
  { id: 'g2', employeeName: 'Marcus Thompson', title: 'Improve Customer Satisfaction Score to 4.8', category: 'Performance', dueDate: '2026-05-31', progress: 40, status: 'at-risk' },
  { id: 'g3', employeeName: 'Priya Sharma', title: 'Lead 2 Team Training Sessions', category: 'Leadership', dueDate: '2026-04-15', progress: 20, status: 'overdue' },
  { id: 'g4', employeeName: 'Carlos Reyes', title: 'Reduce Warehouse Receiving Errors by 30%', category: 'Operations', dueDate: '2026-07-01', progress: 80, status: 'on-track' },
  { id: 'g5', employeeName: 'Tanya Williams', title: 'Complete HR Certification Renewal', category: 'Compliance', dueDate: '2026-03-31', progress: 100, status: 'completed' },
]

function ProgressBar({ pct, status }: { pct: number; status: string }) {
  const barColor = status === 'completed' ? 'bg-blue-500' : status === 'overdue' ? 'bg-red-500' : status === 'at-risk' ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-zinc-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default async function DevelopmentPage() {
  const [courses, enrollments] = await Promise.all([
    prisma.trainingCourse.findMany({ orderBy: { name: 'asc' }, take: 5 }),
    prisma.trainingEnrollment.findMany({
      where: { status: 'enrolled' },
      include: { course: true },
      take: 20,
      orderBy: { enrolledAt: 'desc' },
    }),
  ])

  const goals = MOCK_GOALS
  const onTrack   = goals.filter(g => g.status === 'on-track').length
  const overdue   = goals.filter(g => g.status === 'overdue').length
  const completed = goals.filter(g => g.status === 'completed').length

  return (
    <>
      <TopBar title="Employee Development" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Employee Development</h1>
            <p className="text-[13px] text-zinc-500">Goals, learning, and performance journals</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/hr/development/goals"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-[13px] transition-colors"
            >
              <Target className="w-3.5 h-3.5" />
              Goals
            </Link>
            <Link
              href="/hr/training"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-[13px] transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Training
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Goals', value: goals.length, color: 'text-zinc-100', icon: <Target className="w-4 h-4 text-zinc-500" /> },
            { label: 'On Track', value: onTrack, color: 'text-emerald-400', icon: <TrendingUp className="w-4 h-4 text-emerald-500/60" /> },
            { label: 'Overdue', value: overdue, color: 'text-red-400', icon: <Target className="w-4 h-4 text-red-500/60" /> },
            { label: 'Completed', value: completed, color: 'text-blue-400', icon: <BookOpen className="w-4 h-4 text-blue-500/60" /> },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">{k.label}</p>
                {k.icon}
              </div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Goals panel */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold text-zinc-100">Active Goals</h2>
              <Link href="/hr/development/goals" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                View all →
              </Link>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                  <Target className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-[13px]">No goals defined</p>
                </div>
              ) : (
                <div>
                  {goals.map(g => (
                    <div key={g.id} className="px-4 py-3 border-b border-zinc-800/30 last:border-0">
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="min-w-0 mr-2">
                          <p className="text-[13px] font-medium text-zinc-100 truncate">{g.title}</p>
                          <p className="text-[11px] text-zinc-500">{g.employeeName} · {g.category}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_COLORS[g.status]}`}>
                            {g.status.replace('-', ' ')}
                          </span>
                          <span className="text-[10px] text-zinc-600">Due {new Date(g.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ProgressBar pct={g.progress} status={g.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Learning panel */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold text-zinc-100">Learning Courses</h2>
              <Link href="/hr/training" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                View all →
              </Link>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                  <GraduationCap className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-[13px]">No courses available</p>
                </div>
              ) : (
                <div>
                  {courses.map(c => {
                    const enrolled = enrollments.filter(e => e.courseId === c.id).length
                    return (
                      <div key={c.id} className="px-4 py-3 border-b border-zinc-800/30 last:border-0">
                        <p className="text-[13px] font-medium text-zinc-100 truncate">{c.name}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-[11px] text-zinc-500 capitalize">{c.category} · {c.format}</p>
                          <span className="text-[11px] text-zinc-600">{enrolled} enrolled</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </>
  )
}
