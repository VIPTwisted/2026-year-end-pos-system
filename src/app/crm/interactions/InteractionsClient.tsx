'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Plus, Search, ChevronRight } from 'lucide-react'

interface BCInteraction {
  id: string; entryNo: number; interactionDate: string | null
  contactId: string | null; contactName: string | null
  template: string | null; description: string | null
  cost: number; duration: number; initiatedBy: string
}

const TEMPLATES = ['', 'Phone Call', 'E-Mail', 'Meeting', 'Letter', 'Fax', 'Other']

export default function InteractionsClient() {
  const searchParams = useSearchParams()
  const [rows, setRows] = useState<BCInteraction[]>([])
  const [loading, setLoading] = useState(true)
  const [contactId, setContactId] = useState(searchParams?.get('contactId') ?? '')
  const [salesperson, setSalesperson] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [template, setTemplate] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const q = new URLSearchParams()
    if (contactId) q.set('contactId', contactId)
    if (salesperson) q.set('salesperson', salesperson)
    if (dateFrom) q.set('dateFrom', dateFrom)
    if (dateTo) q.set('dateTo', dateTo)
    if (template) q.set('template', template)
    fetch(`/api/crm/interactions?${q}`)
      .then(r => r.json())
      .then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [contactId, salesperson, dateFrom, dateTo, template])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-semibold text-white">Interaction Log Entries</h1>
            <span className="text-zinc-500 text-sm">({rows.length})</span>
          </div>
          <Link href="/crm/interactions/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> Log Interaction
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-zinc-800 flex gap-3 flex-wrap items-center">
        <input value={contactId} onChange={e => setContactId(e.target.value)}
          placeholder="Contact ID / filter..."
          className="w-44 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500" />
        <input value={salesperson} onChange={e => setSalesperson(e.target.value)}
          placeholder="Initiated By"
          className="w-36 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500" />
        <select value={template} onChange={e => setTemplate(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500">
          <option value="">All Templates</option>
          {TEMPLATES.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
        <span className="text-zinc-600 text-xs">—</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
            <tr className="text-zinc-400 text-[11px] uppercase tracking-wide">
              <th className="px-4 py-2.5 text-left">Entry No.</th>
              <th className="px-4 py-2.5 text-left">Date</th>
              <th className="px-4 py-2.5 text-left">Contact</th>
              <th className="px-4 py-2.5 text-left">Template</th>
              <th className="px-4 py-2.5 text-left">Description</th>
              <th className="px-4 py-2.5 text-right">Cost</th>
              <th className="px-4 py-2.5 text-right">Duration</th>
              <th className="px-4 py-2.5 text-left">Initiated By</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading && <tr><td colSpan={9} className="px-4 py-10 text-center text-zinc-500">Loading...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-zinc-500">No interactions found</td></tr>}
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-zinc-900/80 transition-colors">
                <td className="px-4 py-2.5 font-mono text-indigo-400">{row.entryNo}</td>
                <td className="px-4 py-2.5 text-zinc-400">{row.interactionDate ?? '—'}</td>
                <td className="px-4 py-2.5">
                  {row.contactName ? (
                    <Link href={`/crm/contacts/${row.contactId}`} className="text-indigo-400 hover:underline">{row.contactName}</Link>
                  ) : <span className="text-zinc-600">{row.contactId ?? '—'}</span>}
                </td>
                <td className="px-4 py-2.5 text-zinc-400">{row.template ?? '—'}</td>
                <td className="px-4 py-2.5 text-white max-w-xs truncate">{row.description ?? '—'}</td>
                <td className="px-4 py-2.5 text-zinc-400 text-right">${(row.cost ?? 0).toFixed(2)}</td>
                <td className="px-4 py-2.5 text-zinc-400 text-right">{row.duration}m</td>
                <td className="px-4 py-2.5 text-zinc-400">{row.initiatedBy}</td>
                <td className="px-3 py-2.5"><ChevronRight className="w-3.5 h-3.5 text-zinc-600" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
