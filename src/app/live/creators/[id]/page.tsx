'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, DollarSign, ShoppingBag, Video, Check, X, Edit2, Save } from 'lucide-react'

interface Creator {
  id: string
  name: string
  handle: string
  email: string | null
  phone: string | null
  platforms: string
  tier: string
  commissionRate: number
  totalSales: number
  totalCommission: number
  status: string
  payouts: CreatorPayout[]
}

interface CreatorPayout {
  id: string
  period: string
  grossSales: number
  commissionRate: number
  commission: number
  adjustments: number
  netPayout: number
  status: string
  paidAt: string | null
  paymentMethod: string | null
  createdAt: string
}

const TIER_COLORS: Record<string, string> = {
  standard: 'bg-zinc-700 text-zinc-300 border-zinc-600',
  silver: 'bg-zinc-600/30 text-zinc-200 border-zinc-500/50',
  gold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  platinum: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
}
function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Creator>>({})
  const [saving, setSaving] = useState(false)
  const [genPayout, setGenPayout] = useState(false)
  const [payoutPeriod, setPayoutPeriod] = useState(new Date().toISOString().slice(0, 7))

  async function load() {
    const data = await fetch(`/api/live/creators/${id}`).then(r => r.json())
    setCreator(data)
    setEditForm(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/live/creators/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setSaving(false)
    setEditing(false)
    load()
  }

  async function handlePayoutAction(pid: string, action: 'approved' | 'paid', paymentMethod?: string) {
    await fetch(`/api/live/creators/${id}/payouts/${pid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: action, ...(paymentMethod ? { paymentMethod } : {}) }),
    })
    load()
  }

  async function handleGeneratePayout() {
    await fetch(`/api/live/creators/${id}/payouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period: payoutPeriod }),
    })
    setGenPayout(false)
    load()
  }

  if (loading || !creator) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-zinc-500 text-sm">Loading...</div>
    </div>
  )

  let platforms: { platform: string; handle: string; followers: number }[] = []
  try { platforms = JSON.parse(creator.platforms) } catch {}

  const statusColor = creator.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : creator.status === 'paused' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-red-500/20 text-red-400 border-red-500/30'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/live/creators" className="text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-100">{creator.name}</h1>
              <span className={`px-2 py-0.5 rounded border text-xs capitalize ${TIER_COLORS[creator.tier] ?? TIER_COLORS.standard}`}>{creator.tier}</span>
              <span className={`px-2 py-0.5 rounded-full border text-xs capitalize ${statusColor}`}>{creator.status}</span>
            </div>
            <div className="text-sm text-zinc-500 font-mono mt-0.5">{creator.handle}</div>
            {platforms.length > 0 && (
              <div className="flex gap-2 mt-1">
                {platforms.map((p, i) => (
                  <span key={i} className="text-xs text-zinc-400">
                    <span className="text-zinc-600 capitalize">{p.platform}:</span> {p.handle}
                    {p.followers > 0 && <span className="text-zinc-600 ml-1">({p.followers.toLocaleString()})</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button onClick={() => editing ? handleSave() : setEditing(true)}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${editing ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'}`}>
          {editing ? <><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}</> : <><Edit2 className="w-4 h-4" /> Edit</>}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-500/10 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-500">Total Sales</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{fmt(creator.totalSales)}</div>
        </div>
        <div className="bg-purple-500/10 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-500">Total Commission</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{fmt(creator.totalCommission)}</div>
        </div>
        <div className="bg-blue-500/10 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-500">Commission Rate</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{(creator.commissionRate * 100).toFixed(1)}%</div>
        </div>
      </div>

      {editing && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-100 mb-4">Edit Creator</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name</label>
              <input value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Handle</label>
              <input value={editForm.handle ?? ''} onChange={e => setEditForm(f => ({ ...f, handle: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Email</label>
              <input value={editForm.email ?? ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Phone</label>
              <input value={editForm.phone ?? ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Tier</label>
              <select value={editForm.tier ?? 'standard'} onChange={e => setEditForm(f => ({ ...f, tier: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                {['standard', 'silver', 'gold', 'platinum'].map(t => (
                  <option key={t} value={t} className="bg-zinc-800 capitalize">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Commission Rate (0.10 = 10%)</label>
              <input type="number" step="0.01" min="0" max="1" value={editForm.commissionRate ?? 0.1}
                onChange={e => setEditForm(f => ({ ...f, commissionRate: parseFloat(e.target.value) }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Status</label>
              <select value={editForm.status ?? 'active'} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                {['active', 'paused', 'suspended'].map(s => (
                  <option key={s} value={s} className="bg-zinc-800 capitalize">{s}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" onClick={() => setEditing(false)}
            className="mt-4 px-4 py-2 text-sm border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">Payouts</h2>
          <div className="flex items-center gap-2">
            {genPayout && (
              <div className="flex items-center gap-2">
                <input type="month" value={payoutPeriod} onChange={e => setPayoutPeriod(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                <button onClick={handleGeneratePayout}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">Generate</button>
                <button onClick={() => setGenPayout(false)}
                  className="px-3 py-1 text-xs border border-zinc-700 text-zinc-400 rounded hover:bg-zinc-800 transition-colors">Cancel</button>
              </div>
            )}
            {!genPayout && (
              <button onClick={() => setGenPayout(true)}
                className="px-3 py-1 text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 rounded hover:bg-zinc-700 transition-colors">
                Generate Payout
              </button>
            )}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500">Period</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-zinc-500">Gross Sales</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-zinc-500">Commission %</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-zinc-500">Commission</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-zinc-500">Adjustments</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-zinc-500">Net Payout</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500">Status</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {creator.payouts.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-zinc-600 text-sm">No payouts yet</td></tr>
            ) : creator.payouts.map(payout => (
              <tr key={payout.id} className="hover:bg-zinc-800/30">
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">{payout.period}</td>
                <td className="px-4 py-3 text-right text-zinc-300">{fmt(payout.grossSales)}</td>
                <td className="px-4 py-3 text-right text-zinc-400">{(payout.commissionRate * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-right text-zinc-300">{fmt(payout.commission)}</td>
                <td className="px-4 py-3 text-right text-zinc-400">{payout.adjustments !== 0 ? fmt(payout.adjustments) : '—'}</td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-400">{fmt(payout.netPayout)}</td>
                <td className="px-4 py-3">
                  {payout.status === 'pending' && <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">Pending</span>}
                  {payout.status === 'approved' && <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">Approved</span>}
                  {payout.status === 'paid' && <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Paid {fmtDate(payout.paidAt)}</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {payout.status === 'pending' && (
                      <button onClick={() => handlePayoutAction(payout.id, 'approved')}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors">
                        <Check className="w-3 h-3" /> Approve
                      </button>
                    )}
                    {payout.status === 'approved' && (
                      <button onClick={() => handlePayoutAction(payout.id, 'paid', 'bank-transfer')}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/30 transition-colors">
                        <DollarSign className="w-3 h-3" /> Mark Paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
