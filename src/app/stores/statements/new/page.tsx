'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

type Store = { id: string; name: string }

export default function NewStatementPage() {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [saving, setSaving] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    storeId: '',
    businessDate: today,
    startDate: `${today}T06:00`,
    endDate: `${today}T23:59`,
    statementMethod: 'staff',
  })

  useEffect(() => {
    fetch('/api/stores').then(r => r.json()).then(setStores).catch(() => {})
  }, [])

  const inp = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/statements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          businessDate: new Date(form.businessDate).toISOString(),
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
        }),
      })
      const stmt = await res.json()
      router.push(`/stores/statements/${stmt.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <TopBar title="New Retail Statement" />
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Statement Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Store *</label>
                <select
                  required
                  className={inp}
                  value={form.storeId}
                  onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))}
                >
                  <option value="">Select store...</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Business Date *</label>
                <input type="date" required className={inp} value={form.businessDate}
                  onChange={e => setForm(f => ({ ...f, businessDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Period Start *</label>
                <input type="datetime-local" required className={inp} value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Period End *</label>
                <input type="datetime-local" required className={inp} value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Statement Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'total', label: 'Total' },
                    { value: 'staff', label: 'Staff' },
                    { value: 'pos_terminal', label: 'POS Terminal' },
                    { value: 'shift', label: 'Shift' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, statementMethod: opt.value }))}
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                        form.statementMethod === opt.value
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Save className="w-4 h-4" />{saving ? 'Creating...' : 'Create Statement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
