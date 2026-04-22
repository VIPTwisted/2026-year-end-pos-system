'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Building2 } from 'lucide-react'

interface Props {
  groupId: string
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors'

export function AddCompanyForm({ groupId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    companyName: '',
    currency: 'USD',
    ownershipPct: '100',
    consolidationMethod: 'full',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleAdd = async () => {
    if (!form.companyName) {
      setError('Company name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/consolidation/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addCompany: {
            companyName: form.companyName,
            currency: form.currency,
            ownershipPct: parseFloat(form.ownershipPct),
            consolidationMethod: form.consolidationMethod,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add company')
      setOpen(false)
      setForm({ companyName: '', currency: 'USD', ownershipPct: '100', consolidationMethod: 'full' })
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Add Company</div>
        {!open ? (
          <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => setOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add Company to Group
          </Button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Company Name</label>
              <input type="text" value={form.companyName} onChange={set('companyName')} placeholder="Subsidiary Inc." className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Currency</label>
                <input type="text" value={form.currency} onChange={set('currency')} placeholder="USD" maxLength={3} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Ownership %</label>
                <input type="number" min="0" max="100" step="0.01" value={form.ownershipPct} onChange={set('ownershipPct')} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Method</label>
              <select value={form.consolidationMethod} onChange={set('consolidationMethod')} className={inputCls}>
                <option value="full">Full</option>
                <option value="proportional">Proportional</option>
                <option value="equity">Equity</option>
              </select>
            </div>
            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-2 py-1.5">{error}</div>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" className="flex-1 gap-1.5" onClick={handleAdd} disabled={loading}>
                <Building2 className="w-3 h-3" />
                {loading ? 'Adding…' : 'Add'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
