'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Send, ChevronRight } from 'lucide-react'

type TabKey = 'General' | 'Discount'

export default function NewCampaignPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>('General')
  const [form, setForm] = useState({
    description: '',
    startingDate: '',
    endingDate: '',
    statusCode: 'Active',
    salesperson: '',
    discountPercent: '',
    discountStartDate: '',
    discountEndDate: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(k: keyof typeof form) { return (v: string) => setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.description.trim()) { setError('Description is required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/crm/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description,
          startingDate: form.startingDate || null,
          endingDate: form.endingDate || null,
          statusCode: form.statusCode,
          salesperson: form.salesperson || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); setSaving(false); return }
      router.push(`/crm/campaigns/${data.id}`)
    } catch {
      setError('Network error'); setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <div className="px-6 pt-4 pb-1 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/crm/campaigns" className="hover:text-zinc-300 transition-colors">Campaigns</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-300">New Campaign</span>
      </div>

      <div className="px-6 pt-2 pb-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-semibold text-white">New Campaign</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/crm/campaigns"
            className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white border border-zinc-700 rounded transition-colors">
            Cancel
          </Link>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-medium transition-colors">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-3 px-4 py-2 bg-red-900/30 border border-red-800/50 rounded text-red-400 text-sm">{error}</div>
      )}

      <div className="flex border-b border-zinc-800 px-6 gap-0 mt-2">
        {(['General', 'Discount'] as TabKey[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 px-6 py-5">
        {tab === 'General' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl">
            <div className="md:col-span-2">
              <label className="text-[11px] text-zinc-400 mb-1 block">Description *</label>
              <input value={form.description} onChange={e => set('description')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Starting Date</label>
              <input type="date" value={form.startingDate} onChange={e => set('startingDate')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Ending Date</label>
              <input type="date" value={form.endingDate} onChange={e => set('endingDate')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Status Code</label>
              <select value={form.statusCode} onChange={e => set('statusCode')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                <option>Active</option>
                <option>Inactive</option>
                <option>Completed</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Salesperson Code</label>
              <input value={form.salesperson} onChange={e => set('salesperson')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        )}
        {tab === 'Discount' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl">
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Discount % (Sales)</label>
              <input type="number" min="0" max="100" value={form.discountPercent} onChange={e => set('discountPercent')(e.target.value)}
                placeholder="0"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-zinc-500">Campaign-level discounts will be applied to all associated sales documents when this campaign is active.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
