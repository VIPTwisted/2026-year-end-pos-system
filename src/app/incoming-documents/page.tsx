'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Inbox, Search, Filter, CheckSquare } from 'lucide-react'

interface VendorInvoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  status: string
  matchingStatus: string
  notes: string | null
  vendor: { id: string; name: string }
  lines: { id: string }[]
}

// Map VendorInvoice status to incoming-doc display status
const STATUS_MAP: Record<string, { label: string; style: string }> = {
  draft:      { label: 'Received',   style: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  posted:     { label: 'Processing', style: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  matched:    { label: 'Matched',    style: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
  paid:       { label: 'Posted',     style: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  cancelled:  { label: 'Rejected',   style: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  partial:    { label: 'Processing', style: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
}

// Source display (simulated: all are "upload" for now — real impl would add a source field)
const SOURCE_LABELS = ['email', 'upload', 'api']
function getSource(idx: number) { return SOURCE_LABELS[idx % 3] }

const STATUSES = ['all', 'draft', 'posted', 'matched', 'paid', 'cancelled']

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function IncomingDocumentsPage() {
  const [docs, setDocs] = useState<VendorInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkProcessing, setBulkProcessing] = useState(false)

  function load() {
    const p = new URLSearchParams()
    if (statusFilter !== 'all') p.set('status', statusFilter)
    if (dateFrom) p.set('from', dateFrom)
    if (dateTo) p.set('to', dateTo)
    fetch(`/api/incoming-documents?${p}`)
      .then(r => r.json())
      .then(d => { setDocs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter, dateFrom, dateTo]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = docs.filter(d =>
    search === '' ||
    d.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    d.vendor.name.toLowerCase().includes(search.toLowerCase())
  )

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(d => d.id)))
  }

  async function bulkApprove() {
    if (selected.size === 0) return
    setBulkProcessing(true)
    await fetch('/api/incoming-documents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selected), status: 'matched' }),
    })
    setSelected(new Set())
    setBulkProcessing(false)
    load()
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6">
      <div className="max-w-screen-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
              <Inbox className="w-6 h-6 text-violet-400" />
              Incoming Documents
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Vendor invoices and document intake</p>
          </div>
          {selected.size > 0 && (
            <button
              onClick={bulkApprove}
              disabled={bulkProcessing}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <CheckSquare className="w-4 h-4" />
              Approve {selected.size} Selected
            </button>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {STATUSES.filter(s => s !== 'all').map(s => {
            const count = docs.filter(d => d.status === s).length
            const info = STATUS_MAP[s]
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                className={`bg-[#16213e] border rounded-xl p-4 text-left transition-colors ${statusFilter === s ? 'border-violet-500/50' : 'border-zinc-800/50 hover:border-zinc-700/50'}`}
              >
                <p className="text-2xl font-bold text-zinc-100">{count}</p>
                <p className="text-xs mt-1">
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${info?.style}`}>{info?.label}</span>
                </p>
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by invoice # or vendor…"
              className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-violet-500"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Statuses' : (STATUS_MAP[s]?.label ?? s)}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-violet-500"
            />
            <span className="text-zinc-600 text-xs">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-zinc-500 text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">No incoming documents found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="accent-violet-500"
                    />
                  </th>
                  <th className="text-left px-4 py-3">Invoice #</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Vendor</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Source</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {filtered.map((doc, idx) => {
                  const statusInfo = STATUS_MAP[doc.status]
                  return (
                    <tr key={doc.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(doc.id)}
                          onChange={() => toggleSelect(doc.id)}
                          className="accent-violet-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/incoming-documents/${doc.id}`}
                          className="text-violet-400 hover:text-violet-300 font-mono text-xs"
                        >
                          {doc.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 hidden md:table-cell">{doc.vendor.name}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-zinc-500 uppercase tracking-wide">{getSource(idx)}</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">
                        {new Date(doc.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-200">{fmt(doc.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo?.style ?? 'bg-zinc-700/50 text-zinc-400'}`}>
                          {statusInfo?.label ?? doc.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}
