'use client'
// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Wrench } from 'lucide-react'

// Static asset list for demo — replace with API call once AssetItem schema is added
const MOCK_ASSETS = [
  { id: 'a1', assetNo: 'AST-001', name: 'Forklift #1' },
  { id: 'a2', assetNo: 'AST-002', name: 'Conveyor Belt B' },
  { id: 'a3', assetNo: 'AST-003', name: 'Office HVAC Unit' },
  { id: 'a4', assetNo: 'AST-004', name: 'Pallet Jack Set' },
  { id: 'a5', assetNo: 'AST-005', name: 'Delivery Van 003' },
  { id: 'a6', assetNo: 'AST-006', name: 'Compressor Unit' },
]

export default function NewMaintenanceRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    assetId: '',
    type: 'preventive',
    priority: 'medium',
    description: '',
    assignedTech: '',
    dueDate: '',
    notes: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.assetId) { setError('Please select an asset'); return }
    if (!form.description.trim()) { setError('Description is required'); return }
    if (!form.dueDate) { setError('Due date is required'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/supply-chain/maintenance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: form.assetId,
          type: form.type,
          priority: form.priority,
          description: form.description,
          assignedTech: form.assignedTech || null,
          dueDate: form.dueDate,
          notes: form.notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/supply-chain/asset-management/maintenance-requests')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <TopBar title="New Maintenance Request" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/supply-chain/asset-management/maintenance-requests"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Maintenance Requests
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-zinc-400" />
                  Maintenance Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">

                <div>
                  <label className={labelCls}>Asset <span className="text-red-400">*</span></label>
                  <select value={form.assetId} onChange={set('assetId')} className={inputCls} required>
                    <option value="">— Select Asset —</option>
                    {MOCK_ASSETS.map(a => (
                      <option key={a.id} value={a.id}>{a.assetNo} — {a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Request Type <span className="text-red-400">*</span></label>
                    <select value={form.type} onChange={set('type')} className={inputCls}>
                      <option value="preventive">Preventive</option>
                      <option value="reactive">Reactive</option>
                      <option value="inspection">Inspection</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Priority <span className="text-red-400">*</span></label>
                    <select value={form.priority} onChange={set('priority')} className={inputCls}>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Briefly describe the issue or maintenance needed"
                    className={inputCls}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Assigned Technician</label>
                    <input
                      type="text"
                      value={form.assignedTech}
                      onChange={set('assignedTech')}
                      placeholder="Technician name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Due Date <span className="text-red-400">*</span></label>
                    <input type="date" value={form.dueDate} onChange={set('dueDate')} className={inputCls} required />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={set('notes')}
                    rows={3}
                    placeholder="Additional context, parts needed, access instructions…"
                    className={inputCls + ' resize-none'}
                  />
                </div>

              </CardContent>
            </Card>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link href="/supply-chain/asset-management/maintenance-requests">
                <Button type="button" variant="outline" size="sm">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
