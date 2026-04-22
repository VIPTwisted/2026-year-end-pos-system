'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Zap } from 'lucide-react'

type Program = { id: string; name: string }

const BONUS_TYPES = [
  { value: 'fixed', label: 'Fixed Points', desc: 'Award a fixed number of bonus points' },
  { value: 'multiplier', label: 'Multiplier', desc: 'Multiply points earned (e.g. 2x)' },
  { value: 'threshold', label: 'Threshold', desc: 'Bonus when spend exceeds amount' },
]

const TRIGGERS = [
  { value: 'purchase', label: 'Any Purchase' },
  { value: 'birthday', label: 'Birthday Month' },
  { value: 'signup', label: 'Sign Up' },
  { value: 'first_purchase', label: 'First Purchase' },
  { value: 'product_category', label: 'Product Category' },
]

export default function NewBonusPage() {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [form, setForm] = useState({
    programId: '',
    name: '',
    description: '',
    type: 'fixed',
    value: 100,
    triggerType: 'purchase',
    triggerValue: '',
    startDate: '',
    endDate: '',
    maxUses: '',
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/loyalty/programs').then(r => r.json()).then((data: Program[]) => {
      setPrograms(data)
      if (data.length > 0) setForm(f => ({ ...f, programId: data[0].id }))
    })
  }, [])

  function set(k: string, v: unknown) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.programId) { setError('Select a program'); return }
    setLoading(true)
    setError('')
    const payload = {
      ...form,
      value: parseFloat(String(form.value)),
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      triggerValue: form.triggerValue || null,
    }
    const res = await fetch('/api/loyalty/bonuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) router.push('/loyalty/bonuses')
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  return (
    <>
      <TopBar title="New Bonus Campaign" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-xl">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-zinc-100">New Bonus Campaign</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {programs.length > 1 && (
                  <div>
                    <Label className="text-zinc-300 mb-1 block">Program</Label>
                    <select
                      value={form.programId}
                      onChange={e => set('programId', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm"
                    >
                      {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <Label className="text-zinc-300 mb-1 block">Bonus Name</Label>
                  <Input value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Double Points Weekend"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
                </div>

                <div>
                  <Label className="text-zinc-300 mb-1 block">Description (optional)</Label>
                  <Input value={form.description} onChange={e => set('description', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>

                {/* Type radio */}
                <div>
                  <Label className="text-zinc-300 mb-2 block">Bonus Type</Label>
                  <div className="space-y-2">
                    {BONUS_TYPES.map(bt => (
                      <label key={bt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.type === bt.value ? 'border-blue-500/60 bg-blue-500/10' : 'border-zinc-700 hover:border-zinc-600'}`}>
                        <input type="radio" name="type" value={bt.value} checked={form.type === bt.value}
                          onChange={() => set('type', bt.value)} className="mt-0.5 accent-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{bt.label}</p>
                          <p className="text-xs text-zinc-500">{bt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-zinc-300 mb-1 block">
                    {form.type === 'multiplier' ? 'Multiplier (e.g. 2 for 2x)' : 'Bonus Points'}
                  </Label>
                  <Input type="number" step={form.type === 'multiplier' ? '0.1' : '1'}
                    value={form.value} onChange={e => set('value', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
                </div>

                {/* Trigger */}
                <div>
                  <Label className="text-zinc-300 mb-1 block">Trigger Event</Label>
                  <select value={form.triggerType} onChange={e => set('triggerType', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm">
                    {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                {(form.triggerType === 'product_category' || form.triggerType === 'threshold') && (
                  <div>
                    <Label className="text-zinc-300 mb-1 block">
                      {form.triggerType === 'product_category' ? 'Category ID' : 'Threshold Amount ($)'}
                    </Label>
                    <Input value={form.triggerValue} onChange={e => set('triggerValue', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-300 mb-1 block">Start Date (optional)</Label>
                    <Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                  </div>
                  <div>
                    <Label className="text-zinc-300 mb-1 block">End Date (optional)</Label>
                    <Input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                  </div>
                </div>

                <div>
                  <Label className="text-zinc-300 mb-1 block">Max Uses (blank = unlimited)</Label>
                  <Input type="number" value={form.maxUses} onChange={e => set('maxUses', e.target.value)}
                    placeholder="Unlimited"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="activeToggle" checked={form.isActive}
                    onChange={e => set('isActive', e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-600" />
                  <Label htmlFor="activeToggle" className="text-zinc-300 cursor-pointer">Active immediately</Label>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Create Bonus Campaign'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
