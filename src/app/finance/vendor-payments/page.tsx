'use client'

import { useState, useMemo } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import {
  Plus, Search, ChevronUp, ChevronDown, ChevronsUpDown,
  FileText, Clock, CheckSquare, Send, AlertTriangle, Ban,
} from 'lucide-react'
import type { VendorPaymentInvoice } from '@/app/api/finance/vendor-payments/route'

// ─── Mock data (matches API route) ────────────────────────────────────────────
const INVOICES: VendorPaymentInvoice[] = [
  { id: '1',  number: 'inv62811', vendor: 'Acme Office Supplies',       dueDate: '1/11/2013',  currency: 'USD', amount: 179800.00, balance: -179800.00 },
  { id: '2',  number: 'inv62812', vendor: 'City Power & Light',          dueDate: '2/15/2013',  currency: 'USD', amount:  42500.00, balance:  -42500.00 },
  { id: '3',  number: 'inv62813', vendor: 'City-wide Advertising',       dueDate: '3/01/2013',  currency: 'USD', amount:  28750.00, balance:  -28750.00 },
  { id: '4',  number: 'inv62814', vendor: 'Contoso Asia',                dueDate: '3/22/2013',  currency: 'USD', amount:  95000.00, balance:  -95000.00 },
  { id: '5',  number: 'inv62815', vendor: 'Contoso Asia',                dueDate: '4/05/2013',  currency: 'USD', amount:  67250.00, balance:  -67250.00 },
  { id: '6',  number: 'inv62816', vendor: 'Contoso Chemicals Japan',     dueDate: '4/18/2013',  currency: 'JPY', amount: 512000.00, balance: -512000.00 },
  { id: '7',  number: 'inv62817', vendor: 'Contoso Asia',                dueDate: '5/03/2013',  currency: 'USD', amount:  31400.00, balance:  -31400.00 },
  { id: '8',  number: 'inv62818', vendor: 'Datum Receivers',             dueDate: '5/14/2013',  currency: 'USD', amount: 118900.00, balance: -118900.00 },
  { id: '9',  number: 'inv62819', vendor: 'Fabrikam Electronics',        dueDate: '5/28/2013',  currency: 'USD', amount:  73600.00, balance:  -73600.00 },
  { id: '10', number: 'inv62820', vendor: 'Fabrikam Electronics',        dueDate: '6/10/2013',  currency: 'USD', amount: 245000.00, balance: -245000.00 },
  { id: '11', number: 'inv62821', vendor: 'Fabrikam Supplier',           dueDate: '6/22/2013',  currency: 'USD', amount:  54300.00, balance:  -54300.00 },
  { id: '12', number: 'inv62822', vendor: 'Fabrikam Electronics',        dueDate: '7/08/2013',  currency: 'USD', amount:  88750.00, balance:  -88750.00 },
  { id: '13', number: 'inv62823', vendor: 'Acme Office Supplies',        dueDate: '7/20/2013',  currency: 'USD', amount:  22100.00, balance:  -22100.00 },
  { id: '14', number: 'inv62824', vendor: 'Contoso Chemicals Japan',     dueDate: '8/01/2013',  currency: 'JPY', amount: 390000.00, balance: -390000.00 },
  { id: '15', number: 'inv62825', vendor: 'Datum Receivers',             dueDate: '8/14/2013',  currency: 'USD', amount:  61800.00, balance:  -61800.00 },
]

type SortKey = 'number' | 'vendor' | 'dueDate' | 'currency' | 'amount' | 'balance'
type SortDir = 'asc' | 'desc'
type TabId = 'past-due' | 'not-settled' | 'find'

// ─── Number formatter ──────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

// ─── Sort icon ─────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 text-zinc-600 inline ml-1" />
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-blue-400 inline ml-1" />
    : <ChevronDown className="w-3 h-3 text-blue-400 inline ml-1" />
}

// ─── Left summary tile ─────────────────────────────────────────────────────────
function SummaryTile({
  count, label, variant = 'blue', href,
}: {
  count?: number | string
  label: string
  variant?: 'blue' | 'navy'
  href?: string
}) {
  const base =
    variant === 'navy'
      ? 'bg-[#16213e] border border-[rgba(99,102,241,0.25)]'
      : 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-900/30'
  const inner = (
    <div className={`${base} rounded-lg px-4 py-3 w-full text-left hover:opacity-90 transition-opacity`}>
      {count !== undefined && (
        <p className="text-[22px] font-bold tabular-nums text-white leading-none mb-0.5">{count}</p>
      )}
      <p className="text-[12px] text-blue-100 leading-snug">{label}</p>
    </div>
  )
  return href ? <Link href={href} className="w-full block">{inner}</Link> : <div className="w-full">{inner}</div>
}

export default function VendorPaymentsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('past-due')
  const [selectedId, setSelectedId] = useState<string>('1')
  const [filter, setFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('dueDate')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function toggleSort(col: SortKey) {
    if (col === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(col)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    const q = filter.toLowerCase()
    return INVOICES.filter(
      r => !q || r.vendor.toLowerCase().includes(q) || r.number.toLowerCase().includes(q)
    )
  }, [filter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = a[sortKey]
      let bv: string | number = b[sortKey]
      if (sortKey === 'dueDate') {
        av = new Date(av as string).getTime()
        bv = new Date(bv as string).getTime()
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const TABS: { id: TabId; label: string }[] = [
    { id: 'past-due',    label: 'Invoices past due' },
    { id: 'not-settled', label: 'Payments not settled' },
    { id: 'find',        label: 'Find transactions' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0d0e24] flex flex-col">
      <TopBar title="Vendor Payments" />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left summary panel ─────────────────────────────── */}
        <aside className="w-56 shrink-0 flex flex-col gap-2.5 p-3 border-r border-[rgba(99,102,241,0.15)] bg-[#0d0e24]">
          {/* New pay run CTA */}
          <Link
            href="/finance/vendor-payments/new"
            className="flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg px-4 py-5 hover:from-blue-500 hover:to-blue-600 transition-colors shadow-lg shadow-blue-900/30"
          >
            <Plus className="w-8 h-8 text-white" strokeWidth={1.8} />
            <span className="text-[13px] font-semibold text-white text-center leading-snug">
              New vendor pay run
            </span>
          </Link>

          <SummaryTile
            count={2}
            label="Vendor pay run - not posted"
            variant="blue"
            href="/finance/vendor-payments/runs?status=draft"
          />
          <SummaryTile
            count={0}
            label="Vendor pay run - not posted, assigned to me"
            variant="navy"
            href="/finance/vendor-payments/runs?mine=1"
          />
          <SummaryTile
            label="Electronic payments sent, need bank confirmation"
            variant="blue"
            href="/finance/vendor-payments/electronic"
          />

          {/* Bottom row: 2 side-by-side tiles */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/finance/vendor-payments/past-due"
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg px-3 py-3 hover:from-blue-500 hover:to-blue-600 transition-colors shadow-lg shadow-blue-900/30"
            >
              <p className="text-[20px] font-bold text-white tabular-nums leading-none">74</p>
              <p className="text-[11px] text-blue-100 leading-snug mt-0.5">Invoices past due</p>
            </Link>
            <Link
              href="/finance/vendor-payments/on-hold"
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg px-3 py-3 hover:from-blue-500 hover:to-blue-600 transition-colors shadow-lg shadow-blue-900/30"
            >
              <p className="text-[11px] text-blue-100 leading-snug">Vendors on hold</p>
            </Link>
          </div>
        </aside>

        {/* ── Right main panel ────────────────────────────────── */}
        <main className="flex-1 flex overflow-hidden">

          {/* Vertical tab list */}
          <nav className="w-48 shrink-0 flex flex-col border-r border-[rgba(99,102,241,0.15)] bg-[#0d0e24] py-3">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'text-left px-4 py-2.5 text-[13px] transition-colors border-l-2',
                  activeTab === tab.id
                    ? 'border-l-blue-400 bg-[rgba(99,102,241,0.08)] text-blue-300 font-medium'
                    : 'border-l-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[rgba(255,255,255,0.03)]',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Table panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(99,102,241,0.15)]">
              <h1 className="text-[15px] font-semibold text-zinc-100">Vendor transactions</h1>
              <div className="flex items-center gap-3">
                <Link
                  href="/finance/vendor-payments/settlement-history"
                  className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Settlement history
                </Link>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[rgba(99,102,241,0.15)] bg-[#0d0e24]">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  placeholder="Filter"
                  className="w-full bg-[#16213e] border border-[rgba(99,102,241,0.25)] rounded-md pl-9 pr-3 py-1.5 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead className="sticky top-0 z-10 bg-[#0d0e24]">
                  <tr className="border-b border-[rgba(99,102,241,0.2)]">
                    <th className="w-9 px-3 py-2.5 text-left">
                      <input type="checkbox" className="accent-blue-500 w-3.5 h-3.5" />
                    </th>
                    {(
                      [
                        { key: 'number',   label: 'Number' },
                        { key: 'vendor',   label: 'Vendor' },
                        { key: 'dueDate',  label: 'Due date' },
                        { key: 'currency', label: 'Currency' },
                        { key: 'amount',   label: 'Amount' },
                        { key: 'balance',  label: 'Balance' },
                      ] as { key: SortKey; label: string }[]
                    ).map(col => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        className={[
                          'px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider cursor-pointer select-none whitespace-nowrap',
                          col.key === 'amount' || col.key === 'balance' ? 'text-right' : 'text-left',
                          'text-zinc-500 hover:text-zinc-300 transition-colors',
                        ].join(' ')}
                      >
                        {col.label}
                        <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row, i) => {
                    const isSelected = row.id === selectedId
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedId(row.id)}
                        className={[
                          'cursor-pointer transition-colors border-b border-[rgba(99,102,241,0.08)]',
                          isSelected
                            ? 'bg-blue-600/20 border-l-2 border-l-blue-400'
                            : i % 2 === 0
                            ? 'bg-transparent hover:bg-[rgba(99,102,241,0.05)]'
                            : 'bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(99,102,241,0.05)]',
                        ].join(' ')}
                      >
                        <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => setSelectedId(row.id)} className="accent-blue-500 w-3.5 h-3.5" />
                        </td>
                        <td className="px-3 py-2 text-blue-400 font-mono hover:underline cursor-pointer whitespace-nowrap">
                          {row.number}
                        </td>
                        <td className="px-3 py-2 text-zinc-200 whitespace-nowrap">{row.vendor}</td>
                        <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">{row.dueDate}</td>
                        <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">{row.currency}</td>
                        <td className="px-3 py-2 text-zinc-200 text-right tabular-nums whitespace-nowrap">
                          {fmt(row.amount)}
                        </td>
                        <td className={[
                          'px-3 py-2 text-right tabular-nums whitespace-nowrap',
                          row.balance < 0 ? 'text-red-400' : 'text-emerald-400',
                        ].join(' ')}>
                          {fmt(row.balance)}
                        </td>
                      </tr>
                    )
                  })}
                  {sorted.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-zinc-600 text-[13px]">
                        No transactions match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer count */}
            <div className="flex items-center justify-between px-5 py-2 border-t border-[rgba(99,102,241,0.15)] text-[11px] text-zinc-600">
              <span>{sorted.length} record{sorted.length !== 1 ? 's' : ''}</span>
              {selectedId && (
                <span className="text-zinc-500">
                  Row {sorted.findIndex(r => r.id === selectedId) + 1} of {sorted.length} selected
                </span>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
