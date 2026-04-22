'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Send, Plus, ChevronRight, Search } from 'lucide-react'

interface BCCampaign {
  id: string; campaignNo: string; description: string
  startingDate: string | null; endingDate: string | null
  statusCode: string; salesperson: string | null; noOfContacts: number
}

const STATUS_CODES = ['', 'Active', 'Inactive', 'Completed']

export default function CampaignsClient() {
  const router = useRouter()
  const [rows, setRows] = useState<BCCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusCode, setStatusCode] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (statusCode) q.set('statusCode', statusCode)
    fetch(`/api/crm/campaigns?${q}`)
      .then(r => r.json())
      .then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, statusCode])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <div className="px-6 pt-5 pb-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-semibold text-white">Campaigns</h1>
            <span className="text-zinc-500 text-sm">({rows.length})</span>
          </div>
          <Link href="/crm/campaigns/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Campaign
          </Link>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-zinc-800 flex gap-3 flex-wrap items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="w-60 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 pl-8 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500" />
        </div>
        <select value={statusCode} onChange={e => setStatusCode(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500">
          <option value="">All Statuses</option>
          {STATUS_CODES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
            <tr className="text-zinc-400 text-[11px] uppercase tracking-wide">
              <th className="px-4 py-2.5 text-left">No.</th>
              <th className="px-4 py-2.5 text-left">Description</th>
              <th className="px-4 py-2.5 text-left">Starting Date</th>
              <th className="px-4 py-2.5 text-left">Ending Date</th>
              <th className="px-4 py-2.5 text-left">Status Code</th>
              <th className="px-4 py-2.5 text-left">Salesperson</th>
              <th className="px-4 py-2.5 text-right">No. of Contacts</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading && <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-500">Loading...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-500">No campaigns found</td></tr>}
            {rows.map(row => (
              <tr key={row.id} onClick={() => router.push(`/crm/campaigns/${row.id}`)}
                className="cursor-pointer hover:bg-zinc-900/80 transition-colors">
                <td className="px-4 py-2.5 font-mono text-indigo-400">{row.campaignNo}</td>
                <td className="px-4 py-2.5 text-white font-medium">{row.description}</td>
                <td className="px-4 py-2.5 text-zinc-400">{row.startingDate ?? '—'}</td>
                <td className="px-4 py-2.5 text-zinc-400">{row.endingDate ?? '—'}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${row.statusCode === 'Active' ? 'bg-green-500/20 text-green-400' : row.statusCode === 'Completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700 text-zinc-400'}`}>
                    {row.statusCode}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-zinc-400">{row.salesperson ?? '—'}</td>
                <td className="px-4 py-2.5 text-zinc-300 text-right">{row.noOfContacts ?? 0}</td>
                <td className="px-3 py-2.5"><ChevronRight className="w-3.5 h-3.5 text-zinc-600" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
