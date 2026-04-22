'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, User } from 'lucide-react'

type LineInfo = {
  id: string
  lineNo: number
  actionType: string
  productName: string
  productSku: string
  binCode: string | null
  zoneCode: string | null
  quantity: number
  qtyHandled: number
  isHandled: boolean
}

export function ActivityActions({ activityId, lines }: { activityId: string; lines: LineInfo[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [assignTo, setAssignTo] = useState('')
  const [lineQty, setLineQty] = useState<Record<string, number>>(
    Object.fromEntries(lines.map(l => [l.id, l.quantity]))
  )

  async function handleAssign() {
    if (!assignTo.trim()) return
    setLoading('assign')
    try {
      await fetch(`/api/warehouse/activities/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: assignTo, status: 'in_progress' }),
      })
      router.refresh()
    } catch {
      alert('Failed to assign')
    } finally {
      setLoading(null)
    }
  }

  async function handleRegister() {
    if (!confirm('Register (complete) this activity? This will move inventory between bins.')) return
    setLoading('register')
    try {
      const lineUpdates = lines.map(l => ({ lineId: l.id, qtyHandled: lineQty[l.id] ?? l.quantity }))
      const res = await fetch(`/api/warehouse/activities/${activityId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineUpdates }),
      })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
    } catch {
      alert('Failed to register activity')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3 min-w-[280px]">
      {/* Assign */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-zinc-400">Assign To</p>
        <div className="flex gap-2">
          <Input
            value={assignTo}
            onChange={e => setAssignTo(e.target.value)}
            placeholder="Employee name"
            className="h-8 text-xs flex-1"
          />
          <Button size="sm" variant="outline" onClick={handleAssign} disabled={loading === 'assign'} className="gap-1.5 h-8">
            <User className="w-3.5 h-3.5" />
            {loading === 'assign' ? '…' : 'Assign'}
          </Button>
        </div>
      </div>

      {/* Per-line qty handled */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-zinc-400">Qty Handled per Line</p>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {lines.map(l => (
            <div key={l.id} className="flex items-center gap-2">
              <span className={`text-xs w-10 text-center font-semibold ${l.actionType === 'take' ? 'text-amber-400' : 'text-emerald-400'}`}>
                L{l.lineNo}
              </span>
              <span className="text-xs text-zinc-400 flex-1 truncate">{l.productName}</span>
              <Input
                type="number"
                min={0}
                max={l.quantity}
                step={0.01}
                value={lineQty[l.id] ?? l.quantity}
                onChange={e => setLineQty(prev => ({ ...prev, [l.id]: Number(e.target.value) }))}
                className="h-7 w-20 text-xs text-right"
                disabled={l.isHandled}
              />
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={handleRegister}
        disabled={loading === 'register'}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
      >
        <CheckCircle className="w-4 h-4" />
        {loading === 'register' ? 'Registering…' : 'Register Activity'}
      </Button>
    </div>
  )
}
