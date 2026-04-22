'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Check } from 'lucide-react'

interface Tier { id: string; name: string; minPoints: number }

export default function EnrollMemberPage() {
  const router = useRouter()
  const [tiers, setTiers] = useState<Tier[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ customerName: '', customerEmail: '', customerId: '', tierId: '' })

  useEffect(() => { fetch('/api/loyalty/tiers').then(r => r.json()).then(setTiers) }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSaving(true)
    const res = await fetch('/api/loyalty/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: form.customerName || null,
        customerEmail: form.customerEmail || null,
        customerId: form.customerId || null,
        tierId: form.tierId || null,
      }),
    })
    if (res.ok) {
      const m = await res.json()
      router.push(`/loyalty/members/${m.id}`)
    } else {
      const d = await res.json(); setError(d.error || 'Failed to enroll')
    }
    setSaving(false)
  }

  return (
    <>
      <TopBar title="Enroll Member" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Enroll New Member</h2>
              <p className="text-sm text-zinc-500">Add a customer to the loyalty program</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6 pb-6">
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Full Name</label>
                  <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="e.g. Jane Smith" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Email</label>
                  <input type="email" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Customer ID (from CRM)</label>
                  <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 font-mono"
                    value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} placeholder="Optional" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Starting Tier</label>
                  <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                    value={form.tierId} onChange={e => setForm(f => ({ ...f, tierId: e.target.value }))}>
                    <option value="">Auto (lowest tier)</option>
                    {tiers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.minPoints.toLocaleString()} pts)</option>)}
                  </select>
                </div>
                {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>}
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1" disabled={saving}>
                    <Check className="w-4 h-4 mr-1" />{saving ? 'Enrolling…' : 'Enroll Member'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
