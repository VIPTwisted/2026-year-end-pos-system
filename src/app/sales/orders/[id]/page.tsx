'use client'

import { useState, useEffect, use } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import {
  ChevronDown, CheckCircle2, Truck, X,
  User, BarChart2,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderLine {
  lineNo: number
  itemNo: string
  description: string
  qtyOrdered: string | number
  qtyShipped: number
  qtyInvoiced: number
  unitPrice: number
  discountPct: number
  lineAmount: number
}

// ─── Static data ──────────────────────────────────────────────────────────────

const ORDER_LINES: OrderLine[] = [
  { lineNo: 1, itemNo: '1000', description: 'Widget Assembly A100', qtyOrdered: 50, qtyShipped: 0, qtyInvoiced: 0, unitPrice: 34.99, discountPct: 5, lineAmount: 1662.03 },
  { lineNo: 2, itemNo: '1002', description: 'Control Panel C300', qtyOrdered: 10, qtyShipped: 0, qtyInvoiced: 0, unitPrice: 229.99, discountPct: 0, lineAmount: 2299.90 },
  { lineNo: 3, itemNo: 'SRV-001', description: 'Installation Service', qtyOrdered: '5 hrs', qtyShipped: 0, qtyInvoiced: 0, unitPrice: 125.00, discountPct: 0, lineAmount: 625.00 },
  { lineNo: 4, itemNo: '2010', description: 'Mounting Hardware Kit', qtyOrdered: 10, qtyShipped: 0, qtyInvoiced: 0, unitPrice: 18.95, discountPct: 0, lineAmount: 189.50 },
  { lineNo: 5, itemNo: 'PKG-001', description: 'Freight & Handling', qtyOrdered: 1, qtyShipped: 0, qtyInvoiced: 0, unitPrice: 236.00, discountPct: 0, lineAmount: 236.00 },
]

const SUBTOTAL = 5012.43
const DISCOUNT = -87.93
const TAX = 405.39
const TOTAL = 5417.82

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

// ─── FactBox Card ─────────────────────────────────────────────────────────────

function FactBoxCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
      <div className="flex items-center gap-2">
        <span style={{ color: '#a5b4fc' }}>{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function FactRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: '#94a3b8' }}>{label}</span>
      <span className="text-xs font-medium" style={{ color: accent ? '#a5b4fc' : '#e2e8f0' }}>{value}</span>
    </div>
  )
}

// ─── FastTab ──────────────────────────────────────────────────────────────────

function FastTab({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="group rounded-xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
      <summary
        className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none list-none"
        style={{ background: '#16213e', borderBottom: '1px solid rgba(99,102,241,0.1)' }}
      >
        <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{title}</span>
        <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" style={{ color: '#94a3b8' }} />
      </summary>
      <div className="px-5 py-5" style={{ background: '#16213e' }}>
        {children}
      </div>
    </details>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalesOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const actions = (
    <div className="flex items-center gap-2">
      <button className="px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors" style={{ background: 'rgba(99,102,241,0.85)', color: '#fff' }}>
        Edit
      </button>
      {['Confirm', 'Post Invoice', 'Ship', 'Cancel'].map(label => (
        <button key={label} className="px-3.5 py-1.5 text-sm rounded-lg transition-colors hover:bg-white/5" style={{ border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}>
          {label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title={`Sales Order ${id}`}
        breadcrumb={[
          { label: 'Sales', href: '/sales' },
          { label: 'Orders', href: '/sales/orders' },
          { label: id, href: `/sales/orders/${id}` },
        ]}
        actions={actions}
      />

      {/* Status Bar */}
      <div
        className="flex flex-wrap items-center gap-4 px-6 py-2.5 text-xs"
        style={{ background: 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.12)' }}
      >
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" /> Released
        </span>
        <span style={{ color: '#94a3b8' }}>Released Apr 18, 2026 by <span style={{ color: '#e2e8f0' }}>Alice Chen</span></span>
        <span className="w-px h-3.5 bg-zinc-700" />
        <span style={{ color: '#94a3b8' }}>Order Date: <span style={{ color: '#e2e8f0' }}>Apr 18</span></span>
        <span className="w-px h-3.5 bg-zinc-700" />
        <span style={{ color: '#94a3b8' }}>Requested Delivery: <span style={{ color: '#e2e8f0' }}>Apr 25</span></span>
      </div>

      <main className="flex-1 px-6 py-5">
        {/* Two-column layout: main + factbox sidebar */}
        <div className="flex gap-5" style={{ alignItems: 'flex-start' }}>
          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Order Header FastTab */}
            <FastTab title="Order Header" defaultOpen>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {[
                  ['Order No.', id || 'SO-2026-4812'],
                  ['Customer PO No.', 'CANNON-2026-0441'],
                  ['Order Date', 'Apr 18, 2026'],
                  ['Requested Delivery', 'Apr 25, 2026'],
                  ['Payment Terms', 'Net 30'],
                  ['Currency', 'USD'],
                  ['Sales Rep', 'Alice Chen'],
                  ['Quote No.', 'QT-2026-0901'],
                  ['Ship-To', '192 Fisher Road, Detroit MI 48201'],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-[11px]" style={{ color: '#94a3b8' }}>{label}</span>
                    <span className="text-sm" style={{ color: '#e2e8f0' }}>{value}</span>
                  </div>
                ))}
                {/* Customer with link */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px]" style={{ color: '#94a3b8' }}>Customer</span>
                  <Link href="/sales/customers/C10000" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    The Cannon Group PLC
                  </Link>
                </div>
              </div>
            </FastTab>

            {/* Shipping FastTab — collapsed */}
            <FastTab title="Shipping">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {[
                  ['Carrier', 'UPS Ground'],
                  ['Ship Method', 'Standard Ground'],
                  ['Tracking #', '—'],
                  ['Ship-From', 'Warehouse A, Detroit MI'],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-[11px]" style={{ color: '#94a3b8' }}>{label}</span>
                    <span className="text-sm" style={{ color: '#e2e8f0' }}>{value}</span>
                  </div>
                ))}
              </div>
            </FastTab>

            {/* Order Lines */}
            <details open className="group rounded-xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
              <summary
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none list-none"
                style={{ background: '#16213e', borderBottom: '1px solid rgba(99,102,241,0.1)' }}
              >
                <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>Order Lines</span>
                <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" style={{ color: '#94a3b8' }} />
              </summary>
              <div style={{ background: '#16213e' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                        {['Line #', 'Item No.', 'Description', 'Qty Ordered', 'Qty Shipped', 'Qty Invoiced', 'Unit Price', 'Discount%', 'Line Amount'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left font-medium whitespace-nowrap" style={{ color: '#94a3b8' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ORDER_LINES.map((line, idx) => (
                        <tr
                          key={line.lineNo}
                          style={{
                            background: idx % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
                            borderBottom: '1px solid rgba(99,102,241,0.08)',
                          }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-3 py-2.5 text-center" style={{ color: '#94a3b8' }}>{line.lineNo}</td>
                          <td className="px-3 py-2.5 font-mono" style={{ color: '#a5b4fc' }}>{line.itemNo}</td>
                          <td className="px-3 py-2.5" style={{ color: '#e2e8f0' }}>{line.description}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: '#e2e8f0' }}>{line.qtyOrdered}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: '#94a3b8' }}>{line.qtyShipped}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: '#94a3b8' }}>{line.qtyInvoiced}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: '#e2e8f0' }}>{fmt(line.unitPrice)}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: line.discountPct > 0 ? '#f59e0b' : '#94a3b8' }}>
                            {line.discountPct > 0 ? `${line.discountPct}%` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums font-medium" style={{ color: '#e2e8f0' }}>{fmt(line.lineAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Line totals */}
                <div className="px-5 py-4 flex justify-end" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                  <div className="flex flex-col gap-1.5 min-w-[220px]">
                    {[
                      { label: 'Subtotal', value: fmt(SUBTOTAL) },
                      { label: 'Discount', value: fmt(DISCOUNT), accent: 'amber' },
                      { label: 'Tax (8.25%)', value: fmt(TAX) },
                    ].map(({ label, value, accent }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: '#94a3b8' }}>{label}</span>
                        <span className="text-xs tabular-nums" style={{ color: accent === 'amber' ? '#f59e0b' : '#e2e8f0' }}>{value}</span>
                      </div>
                    ))}
                    <div
                      className="flex items-center justify-between pt-2 mt-1"
                      style={{ borderTop: '1px solid rgba(99,102,241,0.2)' }}
                    >
                      <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>Total</span>
                      <span className="text-sm font-bold tabular-nums" style={{ color: '#a5b4fc' }}>{fmt(TOTAL)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* FactBox Sidebar */}
          <div className="flex flex-col gap-4" style={{ width: 280, flexShrink: 0 }}>
            <FactBoxCard title="Order Statistics" icon={<BarChart2 className="w-3.5 h-3.5" />}>
              <FactRow label="Subtotal" value={fmt(SUBTOTAL)} />
              <FactRow label="Tax" value={fmt(TAX)} />
              <FactRow label="Total" value={fmt(TOTAL)} accent />
              <FactRow label="Paid" value={fmt(0)} />
              <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>Outstanding</span>
                <span className="text-xs font-bold" style={{ color: '#f87171' }}>{fmt(TOTAL)}</span>
              </div>
            </FactBoxCard>

            <FactBoxCard title="Customer Info" icon={<User className="w-3.5 h-3.5" />}>
              <FactRow label="Credit Status" value="Good" />
              <FactRow label="Balance" value="$12,450.00" />
              <FactRow label="Credit Limit" value="$50,000.00" />
              <div className="mt-1">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: '24.9%', background: '#34d399' }} />
                </div>
                <div className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>24.9% of credit limit used</div>
              </div>
            </FactBoxCard>

            <FactBoxCard title="Shipping Status" icon={<Truck className="w-3.5 h-3.5" />}>
              <FactRow label="Items Ordered" value="5 lines" />
              <FactRow label="Items Shipped" value="0" />
              <FactRow label="Items Invoiced" value="0" />
              <div className="mt-2 text-[11px] px-2 py-1.5 rounded" style={{ background: 'rgba(99,102,241,0.1)', color: '#94a3b8' }}>
                Ready to ship — no shipments posted
              </div>
            </FactBoxCard>
          </div>
        </div>
      </main>
    </div>
  )
}
