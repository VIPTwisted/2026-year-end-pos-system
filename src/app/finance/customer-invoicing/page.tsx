'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import {
  Plus, Send, DollarSign, FileText, Printer, Download,
  Mail, Ban, RotateCcw,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────── */
type InvoiceStatus = 'draft' | 'posted' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'written-off'
type FilterTab = 'all' | 'draft' | 'posted' | 'overdue' | 'paid'

interface Invoice {
  id: string
  number: string
  customer: string
  invoiceDate: string
  dueDate: string
  amount: number
  tax: number
  total: number
  paid: number
  balance: number
  status: InvoiceStatus
}

interface ApiData {
  kpis: { invoicesThisMonth: number; totalBilled: number; collected: number; outstanding: number }
  invoices: Invoice[]
}

/* ─── Helpers ────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const STATUS_CFG: Record<InvoiceStatus, { label: string; cls: string }> = {
  draft:        { label: 'Draft',          cls: 'bg-zinc-700/50 text-zinc-300 border border-zinc-600' },
  posted:       { label: 'Posted',         cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
  partial:      { label: 'Partially Paid', cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  paid:         { label: 'Paid',           cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  overdue:      { label: 'Overdue',        cls: 'bg-red-500/15 text-red-400 border border-red-500/30' },
  cancelled:    { label: 'Cancelled',      cls: 'bg-zinc-700/40 text-zinc-500 border border-zinc-600' },
  'written-off':{ label: 'Written Off',    cls: 'bg-zinc-800/60 text-zinc-500 border border-zinc-700' },
}

const TAB_FILTERS: Record<FilterTab, (i: Invoice) => boolean> = {
  all:     () => true,
  draft:   (i) => i.status === 'draft',
  posted:  (i) => i.status === 'posted',
  overdue: (i) => i.status === 'overdue',
  paid:    (i) => i.status === 'paid',
}

/* ─── Component ──────────────────────────────────────── */
export default function CustomerInvoicingPage() {
  const [data, setData] = useState<ApiData | null>(null)
  const [tab, setTab] = useState<FilterTab>('all')

  useEffect(() => {
    fetch('/api/finance/customer-invoicing')
      .then((r) => r.json())
      .then(setData)
  }, [])

  if (!data) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a]">
        <TopBar title="Customer Invoicing" breadcrumb={[{ label: 'Finance', href: '/finance' }]} />
        <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">Loading…</div>
      </div>
    )
  }

  const { kpis, invoices } = data
  const filtered = invoices.filter(TAB_FILTERS[tab])

  const ribbonBtn = (label: string, icon: React.ReactNode, primary = false) => (
    <button
      key={label}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded transition-colors ${
        primary
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
      }`}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Customer Invoicing" breadcrumb={[{ label: 'Finance', href: '/finance' }]} />

      <main className="p-6 space-y-5">

        {/* ── KPI Tiles ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Invoices This Month', value: String(kpis.invoicesThisMonth), color: 'text-zinc-100' },
            { label: 'Total Billed',         value: fmt(kpis.totalBilled),          color: 'text-blue-400' },
            { label: 'Collected',            value: fmt(kpis.collected),            color: 'text-emerald-400' },
            { label: 'Outstanding',          value: fmt(kpis.outstanding),          color: 'text-amber-400' },
          ].map((k) => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-700/60 rounded-xl p-4">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* ── Action Ribbon ── */}
        <div className="flex flex-wrap gap-2">
          {ribbonBtn('+ New Invoice', <Plus className="w-3.5 h-3.5" />, true)}
          {ribbonBtn('Post', <FileText className="w-3.5 h-3.5" />)}
          {ribbonBtn('Send', <Send className="w-3.5 h-3.5" />)}
          {ribbonBtn('Apply Payment', <DollarSign className="w-3.5 h-3.5" />)}
          {ribbonBtn('Credit Note', <RotateCcw className="w-3.5 h-3.5" />)}
          {ribbonBtn('Print', <Printer className="w-3.5 h-3.5" />)}
          {ribbonBtn('Export', <Download className="w-3.5 h-3.5" />)}
          {ribbonBtn('Email', <Mail className="w-3.5 h-3.5" />)}
          {ribbonBtn('Void', <Ban className="w-3.5 h-3.5" />)}
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-1 flex-wrap border-b border-zinc-800 pb-2">
          {(['all', 'draft', 'posted', 'overdue', 'paid'] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-t transition-colors capitalize ${
                tab === t
                  ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Invoice Table ── */}
        <div className="bg-[#16213e] border border-zinc-700/60 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/60">
                {[
                  'Invoice #', 'Customer', 'Invoice Date', 'Due Date',
                  'Amount', 'Tax', 'Total', 'Paid', 'Balance', 'Status',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-zinc-500 text-sm">
                    No invoices match this filter.
                  </td>
                </tr>
              )}
              {filtered.map((inv) => {
                const cfg = STATUS_CFG[inv.status]
                return (
                  <tr
                    key={inv.id}
                    className="border-b border-zinc-800 hover:bg-zinc-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-blue-400 font-mono text-[12px]">{inv.number}</td>
                    <td className="px-4 py-3 text-zinc-100 font-medium text-[13px]">{inv.customer}</td>
                    <td className="px-4 py-3 text-zinc-400 text-[12px]">{inv.invoiceDate}</td>
                    <td className="px-4 py-3 text-zinc-400 text-[12px]">{inv.dueDate}</td>
                    <td className="px-4 py-3 text-zinc-200 text-right">{fmt(inv.amount)}</td>
                    <td className="px-4 py-3 text-zinc-400 text-right">{fmt(inv.tax)}</td>
                    <td className="px-4 py-3 text-zinc-100 font-medium text-right">{fmt(inv.total)}</td>
                    <td className="px-4 py-3 text-emerald-400 text-right">{fmt(inv.paid)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={inv.balance > 0 ? 'text-amber-400 font-medium' : 'text-zinc-500'}>
                        {inv.balance > 0 ? fmt(inv.balance) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
