'use client'

import { useState, useEffect } from 'react'
import { Plus, DollarSign, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Opp = {
  id: string
  name: string
  accountName: string | null
  amount: number
  probability: number
  salesStage: string
  estimatedCloseDate: string | null
  ownerName: string | null
}

const STAGES = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won']
const stageLabel: Record<string, string> = {
  prospecting: 'Prospecting',
  qualification: 'Qualification',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
}
const stageColor: Record<string, string> = {
  prospecting: 'border-t-blue-500',
  qualification: 'border-t-violet-500',
  proposal: 'border-t-amber-500',
  negotiation: 'border-t-orange-500',
  closed_won: 'border-t-emerald-500',
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<Opp[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', accountName: '', amount: '', probability: '20', salesStage: 'prospecting', estimatedCloseDate: '', ownerName: '' })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/sales/opportunities')
    const data = await res.json()
    setOpps(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function create() {
    await fetch('/api/sales/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) || 0, probability: parseInt(form.probability) || 20 }),
    })
    setShowModal(false)
    setForm({ name: '', accountName: '', amount: '', probability: '20', salesStage: 'prospecting', estimatedCloseDate: '', ownerName: '' })
    load()
  }

  const byStage = (stage: string) => opps.filter((o) => o.salesStage === stage)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Opportunities</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your sales pipeline</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md transition-colors">
          <Plus className="w-4 h-4" /> New Opportunity
        </button>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="text-center py-12 text-zinc-600">Loading pipeline...</div>
      ) : (
        <div className="grid grid-cols-5 gap-4 min-h-[60vh]">
          {STAGES.map((stage) => {
            const cards = byStage(stage)
            const total = cards.reduce((s, o) => s + o.amount, 0)
            return (
              <div key={stage} className={cn('bg-zinc-900 border border-zinc-800 rounded-lg border-t-2', stageColor[stage])}>
                <div className="p-3 border-b border-zinc-800">
                  <p className="text-xs font-medium text-zinc-300">{stageLabel[stage]}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-zinc-500">{cards.length} deals</span>
                    <span className="text-xs text-emerald-400">{fmt(total)}</span>
                  </div>
                </div>
                <div className="p-2 space-y-2">
                  {cards.map((opp) => (
                    <Link key={opp.id} href={`/sales/opportunities/${opp.id}`}
                      className="block bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md p-3 transition-colors group">
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-white truncate">{opp.name}</p>
                      {opp.accountName && <p className="text-xs text-zinc-500 mt-0.5 truncate">{opp.accountName}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-mono text-emerald-400">{fmt(opp.amount)}</span>
                        <span className="text-xs text-zinc-500">{opp.probability}%</span>
                      </div>
                      {opp.estimatedCloseDate && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Calendar className="w-3 h-3 text-zinc-600" />
                          <span className="text-xs text-zinc-600">{new Date(opp.estimatedCloseDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {opp.ownerName && (
                        <div className="flex items-center gap-1 mt-1">
                          <User className="w-3 h-3 text-zinc-600" />
                          <span className="text-xs text-zinc-600">{opp.ownerName}</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">New Opportunity</h2>
            {[{ k: 'name', label: 'Name *' }, { k: 'accountName', label: 'Account' }, { k: 'amount', label: 'Amount', type: 'number' }, { k: 'probability', label: 'Probability %', type: 'number' }, { k: 'ownerName', label: 'Owner' }, { k: 'estimatedCloseDate', label: 'Close Date', type: 'date' }].map(({ k, label, type }) => (
              <div key={k}>
                <label className="block text-xs text-zinc-400 mb-1">{label}</label>
                <input type={type || 'text'} value={(form as Record<string, string>)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Stage</label>
              <select value={form.salesStage} onChange={(e) => setForm({ ...form, salesStage: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500">
                {STAGES.map((s) => <option key={s} value={s}>{stageLabel[s]}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-3 py-2 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={create} className="flex-1 px-3 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
