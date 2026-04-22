'use client'
import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

export default function NewPriceGroupPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/commerce/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, view: 'group' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create price group'); return }
      router.push('/commerce/pricing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Price Group" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <span className="hover:text-zinc-300 cursor-pointer" onClick={() => router.push('/commerce/pricing')}>Price Groups</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">New</span>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-zinc-100">New Price Group</h1>
            <div className="flex gap-3">
              <button type="button" onClick={() => router.push('/commerce/pricing')}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{error}</div>}

          <Card>
            <CardContent className="pt-5 pb-5 space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Price Group Code *</label>
                <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono uppercase focus:outline-none focus:border-indigo-500"
                  placeholder="RETAIL" value={form.code}
                  onChange={e => set('code', e.target.value.toUpperCase())} required />
                <p className="text-xs text-zinc-600 mt-1">Unique identifier for this price group. Used in POS rules and discount assignments.</p>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Name *</label>
                <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                  placeholder="Retail Price Group" value={form.name}
                  onChange={e => set('name', e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Description</label>
                <textarea rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Optional description of this price group and its use case."
                  value={form.description}
                  onChange={e => set('description', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </>
  )
}
