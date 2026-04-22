'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckSquare, Clock, AlertTriangle, Plus, ChevronRight,
  ListChecks, CalendarDays, User,
} from 'lucide-react'

interface TaskList {
  id: string
  name: string
  description: string | null
  status: string
  dueDate: string | null
  storeId: string | null
  assignedTo: string | null
  tasks: { id: string; status: string }[]
  createdAt: string
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    completed: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    archived: 'bg-zinc-700 text-zinc-400 border-zinc-600',
  }
  return map[status] ?? 'bg-zinc-700 text-zinc-400'
}

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

function isDueToday(dueDate: string | null) {
  if (!dueDate) return false
  const d = new Date(dueDate)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

export default function TasksPage() {
  const [lists, setLists] = useState<TaskList[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tasks/lists')
      .then(r => r.json())
      .then(data => {
        setLists(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const openLists = lists.filter(l => l.status === 'active')
  const dueToday = lists.filter(l => l.tasks.some(() => isDueToday(l.dueDate))).length
  const overdue = lists.filter(l => l.status === 'active' && isOverdue(l.dueDate)).length
  const completedToday = lists.filter(l => {
    const d = new Date(l.createdAt)
    return l.status === 'completed' && d.toDateString() === new Date().toDateString()
  }).length

  const kpis = [
    { label: 'Open Lists', value: openLists.length, icon: ListChecks, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Due Today', value: dueToday, icon: CalendarDays, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Completed Today', value: completedToday, icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ]

  return (
    <>
      <TopBar title="Task Management" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(k => (
            <Card key={k.label}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500 font-medium">{k.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center`}>
                    <k.icon className={`w-4 h-4 ${k.color}`} />
                  </div>
                </div>
                <div className={`text-2xl font-bold ${k.color}`}>{loading ? '—' : k.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Task Lists</h2>
            <p className="text-sm text-zinc-500">Manage and track operational task lists</p>
          </div>
          <Link href="/tasks/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Task List
            </Button>
          </Link>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Store</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Assigned</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Tasks</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Due Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-zinc-500">Loading...</td>
                  </tr>
                ) : lists.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-zinc-500">No task lists yet.</td>
                  </tr>
                ) : (
                  lists.map(list => {
                    const done = list.tasks.filter(t => t.status === 'completed').length
                    const total = list.tasks.length
                    const over = list.status === 'active' && isOverdue(list.dueDate)
                    return (
                      <tr key={list.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-zinc-100">{list.name}</div>
                          {list.description && <div className="text-xs text-zinc-500 mt-0.5 truncate max-w-xs">{list.description}</div>}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-400">{list.storeId ?? '—'}</td>
                        <td className="px-4 py-3.5">
                          {list.assignedTo ? (
                            <div className="flex items-center gap-1.5 text-zinc-300">
                              <User className="w-3 h-3 text-zinc-500" />
                              {list.assignedTo}
                            </div>
                          ) : (
                            <span className="text-zinc-600">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
                              />
                            </div>
                            <span className="text-xs text-zinc-400">{done}/{total}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {list.dueDate ? (
                            <div className={`flex items-center gap-1.5 text-xs ${over ? 'text-red-400' : 'text-zinc-400'}`}>
                              <Clock className="w-3 h-3" />
                              {new Date(list.dueDate).toLocaleDateString()}
                              {over && <span className="text-red-400 font-medium">Overdue</span>}
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-xs">No due date</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(list.status)}`}>
                            {list.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Link href={`/tasks/${list.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1.5">
                              View <ChevronRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </>
  )
}
