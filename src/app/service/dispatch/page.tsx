'use client'
import { useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, RefreshCw, Filter } from 'lucide-react'
import Link from 'next/link'

const TECHS = ['Alex Torres', 'Jordan Lee', 'Morgan Kim', 'Casey Reeves', 'Sam Patel']

const COLUMNS: { key: string; label: string; color: string }[] = [
  { key: 'open', label: 'Unassigned / Open', color: 'text-amber-400 border-amber-800' },
  { key: 'in-progress', label: 'In Progress', color: 'text-blue-400 border-blue-800' },
  { key: 'on-hold', label: 'On Hold', color: 'text-zinc-400 border-zinc-700' },
  { key: 'completed', label: 'Completed', color: 'text-emerald-400 border-emerald-800' },
]

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-amber-400',
  normal: 'bg-blue-500',
  low: 'bg-zinc-600',
}

type Order = {
  id: string
  orderNumber: string
  description: string
  priority: string
  status: string
  assignedTech: string | null
  dueDate: string | null
  customer: { id: string; firstName: string; lastName: string } | null
  serviceItem: { id: string; description: string } | null
  createdAt: string
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function formatTime(d: string | null) {
  if (!d) return null
  const date = new Date(d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function DispatchBoardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [techFilter, setTechFilter] = useState('')
  const [reassignCard, setReassignCard] = useState<Order | null>(null)
  const [newTech, setNewTech] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams()
    if (techFilter) params.set('assignedTech', techFilter)
    const res = await fetch(`/api/service/orders?${params}`)
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }, [techFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  async function reassign() {
    if (!reassignCard) return
    setSaving(true)
    await fetch(`/api/service/orders/${reassignCard.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedTech: newTech || null, status: newTech ? 'in-progress' : 'open' }),
    })
    setSaving(false)
    setReassignCard(null)
    setNewTech('')
    await fetchOrders()
  }

  const byStatus = (status: string) => orders.filter(o => {
    if (status === 'open') return o.status === 'open' || (o.status !== 'in-progress' && o.status !== 'on-hold' && o.status !== 'completed' && o.status !== 'cancelled')
    return o.status === status
  })

  const now = new Date()

  return (
    <>
      <TopBar title="Dispatch Board" />
      <main className="flex-1 p-4 overflow-auto">

        {/* Filters */}
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Filter className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Filter by tech:</span>
          </div>
          <button
            onClick={() => setTechFilter('')}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              !techFilter ? 'bg-blue-600 text-white border-blue-500' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
            }`}
          >All</button>
          {TECHS.map(t => (
            <button
              key={t}
              onClick={() => setTechFilter(techFilter === t ? '' : t)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                techFilter === t ? 'bg-blue-600 text-white border-blue-500' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
              }`}
            >{t.split(' ')[0]}</button>
          ))}
          <button onClick={fetchOrders} className="ml-auto text-zinc-500 hover:text-zinc-300 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <p className="text-zinc-500 text-sm p-4">Loading board…</p>
        ) : (
          <div className="grid grid-cols-4 gap-4 min-h-[600px]">
            {COLUMNS.map(col => {
              const colOrders = byStatus(col.key)
              return (
                <div key={col.key} className="flex flex-col">
                  <div className={`flex items-center justify-between mb-3 pb-2 border-b ${col.color}`}>
                    <span className={`text-xs font-semibold uppercase tracking-wide ${col.color.split(' ')[0]}`}>
                      {col.label}
                    </span>
                    <span className="text-xs text-zinc-600 bg-zinc-800 rounded-full px-2 py-0.5">
                      {colOrders.length}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    {colOrders.length === 0 && (
                      <div className="rounded-lg border border-dashed border-zinc-800 py-8 text-center text-zinc-700 text-xs">
                        No orders
                      </div>
                    )}
                    {colOrders.map(order => {
                      const isOverdue = order.dueDate && new Date(order.dueDate) < now && col.key !== 'completed'
                      return (
                        <Card
                          key={order.id}
                          className="cursor-pointer hover:border-zinc-600 transition-colors"
                          onClick={() => { setReassignCard(order); setNewTech(order.assignedTech ?? '') }}
                        >
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_COLOR[order.priority] ?? 'bg-zinc-600'}`} />
                                <span className="font-mono text-xs text-zinc-500 truncate">{order.orderNumber}</span>
                              </div>
                              <Badge
                                variant={order.priority === 'urgent' ? 'destructive' : order.priority === 'high' ? 'warning' : 'secondary'}
                                className="text-xs shrink-0 py-0"
                              >
                                {order.priority}
                              </Badge>
                            </div>

                            <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">{order.description}</p>

                            {order.customer && (
                              <p className="text-xs text-zinc-500">
                                {order.customer.firstName} {order.customer.lastName}
                              </p>
                            )}

                            {order.serviceItem && (
                              <p className="text-xs text-zinc-600 truncate">{order.serviceItem.description}</p>
                            )}

                            <div className="flex items-center justify-between pt-1">
                              {order.assignedTech ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-300 font-medium">
                                    {initials(order.assignedTech)}
                                  </div>
                                  <span className="text-xs text-zinc-400 truncate max-w-[80px]">
                                    {order.assignedTech.split(' ')[0]}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-zinc-700 italic">Unassigned</span>
                              )}

                              {order.dueDate && (
                                <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-zinc-600'}`}>
                                  {formatTime(order.dueDate)}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Reassign modal */}
      {reassignCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-zinc-500 mb-0.5">{reassignCard.orderNumber}</p>
                  <p className="text-sm text-zinc-100 line-clamp-2">{reassignCard.description}</p>
                </div>
                <button onClick={() => setReassignCard(null)} className="text-zinc-500 hover:text-zinc-300 ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Assign Technician</p>
                <select
                  value={newTech}
                  onChange={e => setNewTech(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                >
                  <option value="">Unassigned</option>
                  {TECHS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/service/orders/${reassignCard.id}`}>View Order</Link>
                </Button>
                <Button size="sm" onClick={reassign} disabled={saving} className="flex-1">
                  {saving ? 'Saving…' : 'Assign'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
