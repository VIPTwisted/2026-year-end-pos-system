'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, BookOpen, FileText, CheckCircle, AlertTriangle, Search, Filter } from 'lucide-react'

interface GLJournal {
  id: string
  journalNumber: string
  description: string | null
  postingDate: string
  period: string
  status: string
  lineCount: number
  debitTotal: number
  creditTotal: number
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  posted: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  reversed: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

const JOURNAL_TYPES = ['all', 'General', 'Recurring', 'Reversing', 'Opening']
const STATUSES = ['all', 'draft', 'posted', 'reversed']

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function GeneralJournalsPage() {
  const [journals, setJournals] = useState<GLJournal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  function load() {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (typeFilter !== 'all') params.set('type', typeFilter)
    fetch(`/api/general-journals?${params}`)
      .then(r => r.json())
      .then(d => { setJournals(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter, typeFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = journals.filter(j =>
    search === '' ||
    j.journalNumber.toLowerCase().includes(search.toLowerCase()) ||
    (j.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const totalCount = journals.length
  const draftCount = journals.filter(j => j.status === 'draft').length
  const postedCount = journals.filter(j => j.status === 'posted').length
  const unbalancedCount = journals.filter(j => Math.abs(j.debitTotal - j.creditTotal) > 0.01).length

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6">
      <div className="max-w-screen-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              General Journals
            </h1>
            <p className="text-sm text-zinc-500 mt-1">GL journal entries and posting</p>
          </div>
          <Link
            href="/general-journals/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Journal
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Journals', value: totalCount, icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Draft', value: draftCount, icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Posted', value: postedCount, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Unbalanced', value: unbalancedCount, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4 flex items-center gap-4">
              <div className={`${bg} rounded-lg p-2.5`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search journals…"
              className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
            >
              {JOURNAL_TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-zinc-500 text-sm">Loading journals…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">No journals found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Journal No.</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Description</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Posting Date</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Period</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Lines</th>
                  <th className="text-right px-4 py-3">Debit</th>
                  <th className="text-right px-4 py-3">Credit</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {filtered.map(j => {
                  const balanced = Math.abs(j.debitTotal - j.creditTotal) <= 0.01
                  return (
                    <tr key={j.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/general-journals/${j.id}`} className="text-indigo-400 hover:text-indigo-300 font-mono text-xs">
                          {j.journalNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 hidden md:table-cell">
                        {j.description ?? <span className="text-zinc-600 italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 hidden lg:table-cell">
                        {new Date(j.postingDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 font-mono text-xs hidden lg:table-cell">{j.period}</td>
                      <td className="px-4 py-3 text-right text-zinc-400 hidden md:table-cell">{j.lineCount}</td>
                      <td className="px-4 py-3 text-right text-zinc-200 font-mono">{fmt(j.debitTotal)}</td>
                      <td className="px-4 py-3 text-right text-zinc-200 font-mono">{fmt(j.creditTotal)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[j.status] ?? 'bg-zinc-700/50 text-zinc-400'}`}>
                            {j.status}
                          </span>
                          {!balanced && j.status === 'draft' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                              unbalanced
                            </span>
                          )}
                        </div>
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
