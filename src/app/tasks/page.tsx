import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckSquare, Plus, Clock } from 'lucide-react'

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'default' | 'secondary'> = {
  critical: 'destructive',
  high: 'warning',
  medium: 'default',
  low: 'secondary',
}

const STATUS_VARIANT: Record<string, 'secondary' | 'default' | 'success' | 'destructive'> = {
  pending: 'secondary',
  in_progress: 'default',
  completed: 'success',
  cancelled: 'destructive',
}

type PageProps = {
  searchParams: Promise<{ status?: string }>
}

export default async function TasksPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const now = new Date()

  const [allTasks, filteredTasks] = await Promise.all([
    prisma.storeTask.findMany({ select: { status: true, dueDate: true } }),
    prisma.storeTask.findMany({
      where: status && status !== 'all' ? { status } : undefined,
      include: { store: true, taskList: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ])

  const totalTasks = allTasks.length
  const pendingCount = allTasks.filter(t => t.status === 'pending').length
  const inProgressCount = allTasks.filter(t => t.status === 'in_progress').length
  const overdueCount = allTasks.filter(t =>
    t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed' && t.status !== 'cancelled'
  ).length

  const TABS = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
  ]

  const activeTab = status ?? 'all'

  return (
    <>
      <TopBar title="Task Management" />
      <main className="flex-1 p-6 overflow-auto">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Tasks</p>
              <p className="text-2xl font-bold text-zinc-100">{totalTasks}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Pending</p>
              <p className="text-2xl font-bold text-zinc-400">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">In Progress</p>
              <p className="text-2xl font-bold text-blue-400">{inProgressCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Overdue</p>
              </div>
              <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs + Action */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <Link
                key={tab.value}
                href={`/tasks?status=${tab.value}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.value
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <Link href="/tasks/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />New Task
            </Button>
          </Link>
        </div>

        {filteredTasks.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <CheckSquare className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-base font-medium text-zinc-300 mb-2">No tasks</p>
              <p className="text-sm mb-4">
                {activeTab !== 'all' ? `No ${activeTab.replace('_', ' ')} tasks` : 'Create your first task'}
              </p>
              <Link href="/tasks/new">
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />New Task</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Title</th>
                  <th className="text-left pb-3 font-medium">Store</th>
                  <th className="text-left pb-3 font-medium">Assigned To</th>
                  <th className="text-left pb-3 font-medium">Due Date</th>
                  <th className="text-center pb-3 font-medium">Priority</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredTasks.map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < now &&
                    task.status !== 'completed' && task.status !== 'cancelled'
                  return (
                    <tr key={task.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-medium text-zinc-100">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="hover:text-blue-400 transition-colors"
                        >
                          {task.title}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-sm">
                        {task.store?.name ?? <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-sm">
                        {task.assignedTo ?? <span className="text-zinc-600">Unassigned</span>}
                      </td>
                      <td className="py-3 pr-4 text-xs whitespace-nowrap">
                        {task.dueDate ? (
                          <span className={isOverdue ? 'text-red-400 font-semibold' : 'text-zinc-400'}>
                            {formatDate(task.dueDate)}
                            {isOverdue && ' ⚠'}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={PRIORITY_VARIANT[task.priority] ?? 'secondary'} className="capitalize">
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant={STATUS_VARIANT[task.status] ?? 'secondary'} className="capitalize">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
