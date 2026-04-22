'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import {
  Plus, FileText, Building2, ChevronUp, ChevronDown, Filter,
  Info, Copy, Settings, Calendar, Repeat, BookOpen
} from 'lucide-react'

const INITIAL_LEASES = [
  { id: 'GBSI-0001', description: 'BUILDING 1', group: 'BUILDINGS', country: '', workflowStatus: 'None' },
  { id: 'GBSI-0002', description: 'BUILDING 2', group: 'BUILDINGS', country: '', workflowStatus: 'None' },
  { id: 'GBSI-0003', description: 'BUILDING 3', group: 'BUILDINGS', country: '', workflowStatus: 'None' },
  { id: 'GBSI-0004', description: 'VEHICLE 1',  group: 'VEHICLES',  country: '', workflowStatus: 'None' },
  { id: 'GBSI-0005', description: 'VEHICLE 2',  group: 'VEHICLES',  country: '', workflowStatus: 'None' },
  { id: 'GBSI-0006', description: 'VEHICLE 3',  group: 'VEHICLES',  country: '', workflowStatus: 'None' },
]

const SUMMARY = {
  booksNotAcquired: 23,
  booksCommencedThisYear: 1,
  booksOpen: 1,
  leasesExpiringIn30Days: 0,
}

type SortDir = 'asc' | 'desc'
type SortCol = 'id' | 'description' | 'group' | 'country' | 'workflowStatus'

export default function LeaseManagementPage() {
  const [selectedId, setSelectedId]   = useState<string>('GBSI-0001')
  const [filterText, setFilterText]   = useState('')
  const [sortCol, setSortCol]         = useState<SortCol>('id')
  const [sortDir, setSortDir]         = useState<SortDir>('asc')

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    const q = filterText.toLowerCase()
    return INITIAL_LEASES
      .filter(l => !q || l.id.toLowerCase().includes(q) || l.description.toLowerCase().includes(q))
      .sort((a, b) => {
        const av = a[sortCol], bv = b[sortCol]
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
  }, [filterText, sortCol, sortDir])

  function SortIcon({ col }: { col: SortCol }) {
    if (sortCol !== col) return <ChevronUp className="w-3 h-3 opacity-20 inline ml-0.5" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 inline ml-0.5 text-blue-400" />
      : <ChevronDown className="w-3 h-3 inline ml-0.5 text-blue-400" />
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24' }}>
      <TopBar
        title="Lease management"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Lease management', href: '/finance/lease-management' },
        ]}
      />

      {/* Workspace tab bar */}
      <div className="px-6 pt-3 flex items-center gap-0" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
        <button
          className="px-4 py-2 text-[13px] font-medium text-blue-400 border-b-2 border-blue-400 -mb-px"
        >
          Workspace
        </button>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Summary tiles (w-60) ── */}
        <aside className="w-60 shrink-0 p-4 flex flex-col gap-3 overflow-y-auto" style={{ borderRight: '1px solid rgba(99,102,241,0.12)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Summary</p>

          {/* Row of 2 CTA tiles */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/finance/lease-management/new"
              className="flex flex-col items-center justify-center gap-1.5 rounded-lg p-3 text-center transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)', border: '1px solid rgba(59,130,246,0.3)' }}
            >
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="text-[11px] font-semibold text-white leading-tight">Add lease</span>
            </Link>
            <Link
              href="/finance/lease-management"
              className="flex flex-col items-center justify-center gap-1.5 rounded-lg p-3 text-center transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #1e40af, #1e3a8a)', border: '1px solid rgba(59,130,246,0.25)' }}
            >
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-[11px] font-semibold text-white leading-tight">All leases</span>
            </Link>
          </div>

          {/* Count tiles */}
          {[
            { count: SUMMARY.booksNotAcquired,       label: 'Books not yet acquired',         info: false },
            { count: SUMMARY.booksCommencedThisYear,  label: 'Books commenced this year',       info: false },
            { count: SUMMARY.booksOpen,               label: 'Books open',                      info: true  },
            { count: SUMMARY.leasesExpiringIn30Days,  label: 'Leases expiring within 30 days',  info: false },
          ].map(({ count, label, info }) => (
            <div
              key={label}
              className="rounded-lg p-4 flex flex-col gap-1.5 cursor-pointer hover:brightness-110 transition-all"
              style={{ background: '#1a2035', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[26px] font-bold text-white tabular-nums leading-none">{count}</span>
                {info && <Info className="w-3.5 h-3.5 text-zinc-500" />}
              </div>
              <span className="text-[11px] text-zinc-400 leading-snug">{label}</span>
            </div>
          ))}
        </aside>

        {/* ── CENTER: Lease listing ── */}
        <main className="flex-1 flex flex-col overflow-hidden p-4 gap-3 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-zinc-200">Lease listing</p>
          </div>

          {/* Filter bar + action links */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-[12px] rounded-md outline-none focus:ring-1 focus:ring-blue-500/50"
                style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
              />
            </div>
            <div className="flex items-center gap-3">
              {[
                { label: 'Books',                href: '/finance/lease-management/books' },
                { label: 'Lease version history', href: '/finance/lease-management/version-history' },
                { label: 'Adjust lease',          href: '/finance/lease-management/adjust' },
                { label: 'Copy lease',            href: '/finance/lease-management/copy' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors underline-offset-2 hover:underline">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto rounded-lg" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr style={{ background: '#16213e', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                  <th className="w-8 px-3 py-2.5 text-left">
                    <input type="checkbox" className="accent-blue-500 w-3.5 h-3.5" />
                  </th>
                  {(
                    [
                      { col: 'id',             label: 'Lease ID' },
                      { col: 'description',    label: 'Lease description' },
                      { col: 'group',          label: 'Lease group' },
                      { col: 'country',        label: 'Country/region' },
                      { col: 'workflowStatus', label: 'Workflow status' },
                    ] as { col: SortCol; label: string }[]
                  ).map(({ col, label }) => (
                    <th
                      key={col}
                      className="px-3 py-2.5 text-left font-semibold text-zinc-400 uppercase tracking-wide cursor-pointer select-none hover:text-zinc-200 transition-colors"
                      style={{ fontSize: '10px' }}
                      onClick={() => handleSort(col)}
                    >
                      {label} <SortIcon col={col} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lease, i) => {
                  const selected = lease.id === selectedId
                  return (
                    <tr
                      key={lease.id}
                      onClick={() => setSelectedId(lease.id)}
                      className="cursor-pointer transition-colors"
                      style={{
                        background: selected
                          ? 'rgba(59,130,246,0.12)'
                          : i % 2 === 0 ? '#0d0e24' : 'rgba(22,33,62,0.5)',
                        borderBottom: '1px solid rgba(99,102,241,0.08)',
                        boxShadow: selected ? 'inset 0 0 0 1px rgba(59,130,246,0.25)' : undefined,
                      }}
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={selected}
                          readOnly
                          className="accent-blue-500 w-3.5 h-3.5"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/finance/lease-management/${lease.id}`}
                          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          {lease.id}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-300">{lease.description}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{lease.group}</td>
                      <td className="px-3 py-2.5 text-zinc-500">{lease.country}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{lease.workflowStatus}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Add lease button below table */}
          <div>
            <Link
              href="/finance/lease-management/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md text-white transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)', border: '1px solid rgba(59,130,246,0.3)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add lease
            </Link>
          </div>
        </main>

        {/* ── RIGHT: Related links (w-48) ── */}
        <aside className="w-48 shrink-0 p-4 overflow-y-auto" style={{ borderLeft: '1px solid rgba(99,102,241,0.12)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Related links</p>

          {/* Setup section */}
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(165,180,252,0.5)' }}>Setup</p>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Asset leasing parameters', href: '/finance/lease-management/setup/parameters' },
                { label: 'Index rate type',           href: '/finance/lease-management/setup/index-rates' },
                { label: 'Location details',          href: '/finance/lease-management/setup/locations' },
                { label: 'Lease groups',              href: '/finance/lease-management/setup/groups' },
                { label: 'Lease books',               href: '/finance/lease-management/setup/books' },
                { label: 'Lease workflow',            href: '/finance/lease-management/setup/workflow' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors leading-snug"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Periodic section */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(165,180,252,0.5)' }}>Periodic</p>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Index rate revaluation', href: '/finance/lease-management/periodic/index-revaluation' },
                { label: 'Batch journal creation', href: '/finance/lease-management/periodic/batch-journals' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors leading-snug"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
