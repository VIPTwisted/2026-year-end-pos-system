'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Target, ChevronRight } from 'lucide-react'

interface BCContact { id: string; contactNo: string; name: string }
interface BCCampaign { id: string; campaignNo: string; description: string }

type TabKey = 'General' | 'Interaction' | 'Statistics'

const STAGES = ['Initial Contact', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']

export default function NewOpportunityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<TabKey>('General')
  const [contacts, setContacts] = useState<BCContact[]>([])
  const [campaigns, setCampaigns] = useState<BCCampaign[]>([])
  const [form, setForm] = useState({
    description: '',
    contactId: searchParams?.get('contactId') ?? '',
    salesperson: '',
    status: 'Open',
    stage: 'Initial Contact',
    probability: '10',
    estimatedValue: '',
    closeDate: '',
    campaignId: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/crm/contacts').then(r => r.json()),
      fetch('/api/crm/campaigns').then(r => r.json()),
    ]).then(([c, camp]) => {
      setContacts(Array.isArray(c) ? c : [])
      setCampaigns(Array.isArray(camp) ? camp : [])
    })
  }, [])

  function set(k: keyof typeof form) { return (v: string) => setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.description.trim()) { setError('Description is required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/crm/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description,
          contactId: form.contactId || null,
          salesperson: form.salesperson || null,
          status: form.status,
          stage: form.stage || null,
          probability: parseFloat(form.probability || '0'),
          estimatedValue: parseFloat(form.estimatedValue || '0'),
          closeDate: form.closeDate || null,
          campaignId: form.campaignId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); setSaving(false); return }
      router.push(`/crm/opportunities/${data.id}`)
    } catch {
      setError('Network error'); setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <div className="px-6 pt-4 pb-1 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/crm/opportunities" className="hover:text-zinc-300 transition-colors">Opportunities</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-300">New Opportunity</span>
      </div>

      <div className="px-6 pt-2 pb-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-semibold text-white">New Opportunity</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/crm/opportunities"
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

      {/* FastTabs */}
      <div className="flex border-b border-zinc-800 px-6 gap-0 mt-2">
        {(['General', 'Interaction', 'Statistics'] as TabKey[]).map(t => (
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
              <label className="text-[11px] text-zinc-400 mb-1 block">Contact</label>
              <select value={form.contactId} onChange={e => set('contactId')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                <option value="">— None —</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Salesperson Code</label>
              <input value={form.salesperson} onChange={e => set('salesperson')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Status</label>
              <select value={form.status} onChange={e => set('status')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                <option>Open</option>
                <option>Won</option>
                <option>Lost</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Sales Cycle Stage</label>
              <select value={form.stage} onChange={e => set('stage')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Probability (%)</label>
              <input type="number" min="0" max="100" value={form.probability} onChange={e => set('probability')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Estimated Value (USD)</label>
              <input type="number" min="0" value={form.estimatedValue} onChange={e => set('estimatedValue')(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Closing Date</label>
              <input type="date" value={form.closeDate} onChange={e => set('closeDate')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        )}

        {tab === 'Interaction' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl">
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Campaign No.</label>
              <select value={form.campaignId} onChange={e => set('campaignId')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                <option value="">— None —</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.description} ({c.campaignNo})</option>)}
              </select>
            </div>
          </div>
        )}

        {tab === 'Statistics' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 max-w-xl">
            <p className="text-sm text-zinc-500">Statistics will be available after creating the opportunity.</p>
          </div>
        )}
      </div>
    </div>
  )
}
