'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, DollarSign, Users, TrendingUp, Copy, Check,
  Plus, X, Loader2, ExternalLink, Trash2
} from 'lucide-react'

interface Referral {
  id: string
  orderId: string | null
  customerName: string | null
  saleAmount: number
  commissionRate: number
  commissionAmount: number
  status: string
  createdAt: string
}

interface Commission {
  id: string
  commissionType: string
  amount: number
  description: string | null
  status: string
  createdAt: string
}

interface Payout {
  id: string
  period: string
  directCommission: number
  overrideCommission: number
  bonuses: number
  totalEarned: number
  netPayout: number
  status: string
  paidAt: string | null
}

interface TrackingLink {
  id: string
  name: string | null
  destinationUrl: string
  trackingCode: string
  clicks: number
  conversions: number
  revenue: number
  isActive: boolean
  createdAt: string
}

interface AffiliateDetail {
  id: string
  affiliateCode: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  tierName: string | null
  sponsorId: string | null
  status: string
  totalSales: number
  totalCommission: number
  teamSize: number
  teamSales: number
  program: { name: string; commissionRate: number }
  referrals: Referral[]
  commissions: Commission[]
  payouts: Payout[]
  links: TrackingLink[]
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400',
  paused: 'bg-amber-500/15 text-amber-400',
  suspended: 'bg-rose-500/15 text-rose-400',
  pending: 'bg-zinc-700 text-zinc-400',
  confirmed: 'bg-blue-500/15 text-blue-400',
  paid: 'bg-violet-500/15 text-violet-400',
  cancelled: 'bg-rose-500/15 text-rose-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
}

const TABS = ['Overview', 'Referrals', 'Tracking Links', 'Payouts'] as const
type Tab = typeof TABS[number]

export default function AffiliateProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [affiliate, setAffiliate] = useState<AffiliateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('Overview')
  const [copied, setCopied] = useState<string | null>(null)
  const [addReferral, setAddReferral] = useState(false)
  const [refForm, setRefForm] = useState({ orderId: '', customerName: '', saleAmount: '' })
  const [savingRef, setSavingRef] = useState(false)
  const [addLink, setAddLink] = useState(false)
  const [linkForm, setLinkForm] = useState({ name: '', destinationUrl: '' })
  const [savingLink, setSavingLink] = useState(false)
  const [addPayout, setAddPayout] = useState(false)
  const [payoutPeriod, setPayoutPeriod] = useState('')
  const [savingPayout, setSavingPayout] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/affiliate/affiliates/${id}`)
    setAffiliate(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  async function changeStatus(status: string) {
    await fetch(`/api/affiliate/affiliates/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function confirmReferral(rid: string) {
    await fetch(`/api/affiliate/affiliates/${id}/referrals/${rid}/confirm`, { method: 'POST' })
    load()
  }

  async function handleAddReferral(e: React.FormEvent) {
    e.preventDefault()
    setSavingRef(true)
    await fetch(`/api/affiliate/affiliates/${id}/referrals`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...refForm, saleAmount: parseFloat(refForm.saleAmount) }),
    })
    setSavingRef(false)
    setAddReferral(false)
    setRefForm({ orderId: '', customerName: '', saleAmount: '' })
    load()
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    setSavingLink(true)
    await fetch(`/api/affiliate/affiliates/${id}/links`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linkForm),
    })
    setSavingLink(false)
    setAddLink(false)
    setLinkForm({ name: '', destinationUrl: '' })
    load()
  }

  async function toggleLink(lid: string, isActive: boolean) {
    await fetch(`/api/affiliate/affiliates/${id}/links/${lid}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    load()
  }

  async function deleteLink(lid: string) {
    if (!confirm('Delete this link?')) return
    await fetch(`/api/affiliate/affiliates/${id}/links/${lid}`, { method: 'DELETE' })
    load()
  }

  async function handleGeneratePayout(e: React.FormEvent) {
    e.preventDefault()
    setSavingPayout(true)
    await fetch(`/api/affiliate/affiliates/${id}/payouts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period: payoutPeriod }),
    })
    setSavingPayout(false)
    setAddPayout(false)
    setPayoutPeriod('')
    load()
  }

  async function updatePayout(pid: string, status: string) {
    await fetch(`/api/affiliate/affiliates/${id}/payouts/${pid}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return <div className="p-8 text-zinc-500 text-sm">Loading...</div>
  if (!affiliate) return <div className="p-8 text-rose-400 text-sm">Affiliate not found</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/affiliate/affiliates" className="text-zinc-500 hover:text-zinc-100"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-100">{affiliate.firstName} {affiliate.lastName}</h1>
            <span className="font-mono text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{affiliate.affiliateCode}</span>
            {affiliate.tierName && <span className="px-2 py-0.5 bg-blue-500/15 text-blue-400 rounded text-xs font-medium">{affiliate.tierName}</span>}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[affiliate.status] ?? ''}`}>{affiliate.status}</span>
          </div>
          <div className="text-sm text-zinc-500 mt-0.5">{affiliate.email} · {affiliate.program.name}</div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-100'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Sales', value: fmt(affiliate.totalSales), icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'Direct Commission', value: fmt(affiliate.totalCommission), icon: DollarSign, color: 'text-amber-400' },
              { label: 'Team Sales', value: fmt(affiliate.teamSales), icon: TrendingUp, color: 'text-blue-400' },
              { label: 'Team Size', value: affiliate.teamSize.toString(), icon: Users, color: 'text-violet-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs text-zinc-500 uppercase tracking-wide">{label}</span>
                </div>
                <div className="text-xl font-bold text-zinc-100">{value}</div>
              </div>
            ))}
          </div>
          {affiliate.sponsorId && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">Sponsor (Upline)</div>
              <div className="text-sm text-zinc-300 font-mono">{affiliate.sponsorId}</div>
            </div>
          )}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Status Management</div>
            <div className="flex gap-2">
              <button onClick={() => changeStatus('active')} disabled={affiliate.status === 'active'}
                className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-40">Activate</button>
              <button onClick={() => changeStatus('paused')} disabled={affiliate.status === 'paused'}
                className="px-3 py-1.5 text-xs rounded-lg bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 disabled:opacity-40">Pause</button>
              <button onClick={() => changeStatus('suspended')} disabled={affiliate.status === 'suspended'}
                className="px-3 py-1.5 text-xs rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 disabled:opacity-40">Suspend</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'Referrals' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setAddReferral(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">
              <Plus className="w-4 h-4" /> Add Referral
            </button>
          </div>
          {addReferral && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-100">Add Referral</h3>
                <button onClick={() => setAddReferral(false)}><X className="w-4 h-4 text-zinc-500" /></button>
              </div>
              <form onSubmit={handleAddReferral} className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Order ID</label>
                  <input value={refForm.orderId} onChange={e => setRefForm(f => ({ ...f, orderId: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Customer Name</label>
                  <input value={refForm.customerName} onChange={e => setRefForm(f => ({ ...f, customerName: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Sale Amount ($) *</label>
                  <input required type="number" step="0.01" min="0" value={refForm.saleAmount}
                    onChange={e => setRefForm(f => ({ ...f, saleAmount: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-3 text-xs text-zinc-500">
                  Commission auto-computed at {(affiliate.program.commissionRate * 100).toFixed(1)}%
                </div>
                <div className="col-span-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setAddReferral(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100">Cancel</button>
                  <button type="submit" disabled={savingRef}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                    {savingRef && <Loader2 className="w-3 h-3 animate-spin" />} Add Referral
                  </button>
                </div>
              </form>
            </div>
          )}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {affiliate.referrals.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No referrals yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
                      <th className="px-4 py-3 text-left">Order#</th>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-right">Sale Amount</th>
                      <th className="px-4 py-3 text-right">Rate</th>
                      <th className="px-4 py-3 text-right">Commission</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {affiliate.referrals.map(r => (
                      <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-zinc-400">{r.orderId ?? '—'}</td>
                        <td className="px-4 py-3 text-zinc-300">{r.customerName ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-emerald-400 font-medium">{fmt(r.saleAmount)}</td>
                        <td className="px-4 py-3 text-right text-zinc-400">{(r.commissionRate * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right text-amber-400">{fmt(r.commissionAmount)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[r.status] ?? ''}`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          {r.status === 'pending' && (
                            <button onClick={() => confirmReferral(r.id)} className="text-xs text-blue-400 hover:underline">Confirm</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'Tracking Links' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setAddLink(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">
              <Plus className="w-4 h-4" /> New Link
            </button>
          </div>
          {addLink && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-100">New Tracking Link</h3>
                <button onClick={() => setAddLink(false)}><X className="w-4 h-4 text-zinc-500" /></button>
              </div>
              <form onSubmit={handleAddLink} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Label</label>
                  <input value={linkForm.name} onChange={e => setLinkForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Instagram Bio"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Destination URL *</label>
                  <input required type="url" value={linkForm.destinationUrl}
                    onChange={e => setLinkForm(f => ({ ...f, destinationUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setAddLink(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100">Cancel</button>
                  <button type="submit" disabled={savingLink}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                    {savingLink && <Loader2 className="w-3 h-3 animate-spin" />} Generate Link
                  </button>
                </div>
              </form>
            </div>
          )}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {affiliate.links.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No tracking links yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Destination</th>
                      <th className="px-4 py-3 text-left">Code</th>
                      <th className="px-4 py-3 text-right">Clicks</th>
                      <th className="px-4 py-3 text-right">Conv.</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                      <th className="px-4 py-3 text-left">Active</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {affiliate.links.map(l => (
                      <tr key={l.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 text-zinc-300">{l.name ?? '—'}</td>
                        <td className="px-4 py-3 max-w-xs">
                          <a href={l.destinationUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline flex items-center gap-1 truncate">
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{l.destinationUrl}</span>
                          </a>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-400">{l.trackingCode}</td>
                        <td className="px-4 py-3 text-right text-zinc-400">{l.clicks}</td>
                        <td className="px-4 py-3 text-right text-zinc-400">{l.conversions}</td>
                        <td className="px-4 py-3 text-right text-emerald-400">{fmt(l.revenue)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleLink(l.id, l.isActive)}
                            className={`w-8 h-4 rounded-full transition-colors relative ${l.isActive ? 'bg-emerald-600' : 'bg-zinc-700'}`}>
                            <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${l.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => copyToClipboard(l.trackingCode, l.id)} className="text-zinc-500 hover:text-zinc-100" title="Copy tracking code">
                              {copied === l.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button onClick={() => deleteLink(l.id)} className="text-zinc-500 hover:text-rose-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'Payouts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setAddPayout(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">
              <Plus className="w-4 h-4" /> Generate Payout
            </button>
          </div>
          {addPayout && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-100">Generate Payout</h3>
                <button onClick={() => setAddPayout(false)}><X className="w-4 h-4 text-zinc-500" /></button>
              </div>
              <form onSubmit={handleGeneratePayout} className="flex items-end gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Period (YYYY-MM) *</label>
                  <input required value={payoutPeriod} onChange={e => setPayoutPeriod(e.target.value)}
                    placeholder="2026-04" pattern="\d{4}-\d{2}"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <button type="button" onClick={() => setAddPayout(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100">Cancel</button>
                <button type="submit" disabled={savingPayout}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {savingPayout && <Loader2 className="w-3 h-3 animate-spin" />} Generate
                </button>
              </form>
            </div>
          )}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {affiliate.payouts.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No payouts generated yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
                      <th className="px-4 py-3 text-left">Period</th>
                      <th className="px-4 py-3 text-right">Direct</th>
                      <th className="px-4 py-3 text-right">Override</th>
                      <th className="px-4 py-3 text-right">Bonuses</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-right">Net Payout</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {affiliate.payouts.map(p => (
                      <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-zinc-300">{p.period}</td>
                        <td className="px-4 py-3 text-right text-zinc-400">{fmt(p.directCommission)}</td>
                        <td className="px-4 py-3 text-right text-zinc-400">{fmt(p.overrideCommission)}</td>
                        <td className="px-4 py-3 text-right text-zinc-400">{fmt(p.bonuses)}</td>
                        <td className="px-4 py-3 text-right text-zinc-200 font-medium">{fmt(p.totalEarned)}</td>
                        <td className="px-4 py-3 text-right text-emerald-400 font-bold">{fmt(p.netPayout)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[p.status] ?? ''}`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {p.status === 'pending' && (
                              <button onClick={() => updatePayout(p.id, 'approved')} className="text-xs text-blue-400 hover:underline">Approve</button>
                            )}
                            {p.status === 'approved' && (
                              <button onClick={() => updatePayout(p.id, 'paid')} className="text-xs text-emerald-400 hover:underline">Mark Paid</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
