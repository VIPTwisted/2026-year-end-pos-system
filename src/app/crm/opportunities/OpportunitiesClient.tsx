'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Target, Plus, ChevronRight } from 'lucide-react'

interface BCOpportunity {
  id: string; opportunityNo: string; description: string
  contactId: string | null; contactName: string | null
  salesperson: string | null; status: string; stage: string | null
  probability: number; estimatedValue: number; closeDate: string | null
  campaignId: string | null
}

const STATUSES = ['', 'Open', 'Won', 'Lost']

const STATUS_COLOR: Record<string, string> = {
  Open: 'bg-yellow-500/20 text-yellow-400',
  Won: 'bg-green-500/20 text-green-400',
  Lost: 'bg-red-500/20 text-red-400',
}

function ProbBar({ value }: { value: number }) {
  const color = value >= 70 ? 'bg-green-500' : value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-xs text-zinc-400">{value}%</span>
    </div>
  )
}

export default function OpportunitiesClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [rows, setRows] = useState<BCOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [salesperson, setSalesperson] = useState('')
  const [contactId, setContactId] = useState(searchParams?.get('contactId') ?? '')
  const [status, setStatus] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const q = new URLSearchParams()
    if (salesperson) q.set('salesperson', salesperson)
    if (contactId) q.set('contactId', contactId)
    if (status) q.set('status', status)
    if (campaignId) q.set('campaignId', campaignId)
    if (dateFrom) q.set('dateFrom', dateFrom)
    if (dateTo) q.set('dateTo', dateTo)
    fetch(`/api/crm/opportunities?${q}`)
      .then(r => r.json())
      .then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [salesperson, contactId, status, campaignId, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  const totalValue = rows.reduce((s, r) => s + (r.estimatedValue ?? 0), 0)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <div className="px-6 pt-5 pb-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-semibold text-white">Opportunities</h1>
            <span className="text-zinc-500 text-sm">({rows.length})</span>
            {totalValue > 0 && (
              <span className="ml-2 text-xs text-zinc-500">· ${totalValue.toLocaleString()} est. pipeline</span>
            )}
          </div>
          <Link href="/crm/opportunities/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Opportunity
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-zinc-800 flex gap-3 flex-wrap items-center">
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500">
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={salesperson} onChange={e => setSalesperson(e.target.value)}
          placeholder="Salesperson"
          className="w-36 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500" />
        <input value={contactId} onChange={e => setContactId(e.target.value)}
          placeholder="Contact ID"
          className="w-36 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500" />
        <input value={campaignId} onChange={e => setCampaignId(e.target.value)}
          placeholder="Campaign ID"
          className="w-36 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500" />
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
        <span className="text-zinc-600 text-xs">—</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
            <tr className="text-zinc-400 text-[11px] uppercase tracking-wide">
              <th className="px-4 py-2.5 text-left">No.</th>
              <th className="px-4 py-2.5 text-left">Description</th>
              <th className="px-4 py-2.5 text-left">Contact</th>
              <th className="px-4 py-2.5 text-left">Salesperson</th>
              <th className="px-4 py-2.5 text-left">Status</th>
              <th className="px-4 py-2.5 text-left">Stage</th>
              <th className="px-4 py-2.5 text-left">Probability</th>
              <th className="px-4 py-2.5 text-right">Est. Value</th>
              <th className="px-4 py-2.5 text-left">Close Date</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading && <tr><td colSpan={10} className="px-4 py-10 text-center text-zinc-500">Loading...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={10} className="px-4 py-10 text-center text-zinc-500">No opportunities found</td></tr>}
            {rows.map(row => (
              <tr key={row.id} onClick={() => router.push(`/crm/opportunities/${row.id}`)}
                className="cursor-pointer hover:bg-zinc-900/80 transition-colors">
                <td className="px-4 py-2.5 font-mono text-indigo-400">{row.opportunityNo}</td>
                <td className="px-4 py-2.5 text-white font-medium max-w-[200px] truncate">{row.description}</td>
                <td className="px-4 py-2.5">
                  {row.contactName ? (
                    <Link href={`/crm/contacts/${row.contactId}`} onClick={e => e.stopPropagation()}
                      className="text-indigo-400 hover:underline">{row.contactName}</Link>
                  ) : <span className="text-zinc-600">—</span>}
                </td>
                <td className="px-4 py-2.5 text-zinc-400">{row.salesperson ?? '—'}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLOR[row.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-zinc-400">{row.stage ?? '—'}</td>
                <td className="px-4 py-2.5"><ProbBar value={row.probability ?? 0} /></td>
                <td className="px-4 py-2.5 text-zinc-300 text-right">${(row.estimatedValue ?? 0).toLocaleString()}</td>
                <td className="px-4 py-2.5 text-zinc-400">{row.closeDate ?? '—'}</td>
                <td className="px-3 py-2.5"><ChevronRight className="w-3.5 h-3.5 text-zinc-600" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
