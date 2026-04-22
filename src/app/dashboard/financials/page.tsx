'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronRight,
  Users,
  ShoppingCart,
  FileText,
  Package,
  UserPlus,
  Building2,
  LayoutGrid,
} from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────
interface TopCustomer {
  name: string
  value: number
  color: string
}

interface StartTile {
  label: string
  icon: string
  href: string
}

interface FinancialsData {
  salesQuotes: number
  salesOrders: number
  salesInvoices: number
  salesThisMonth: number
  purchaseOrders: number
  ongoingPurchaseInvoices: number
  overduePurchInvoiceAmount: number
  purchInvoicesDueNextWeek: number
  overdueSalesInvoiceAmount: number
  unprocessedPayments: number
  avgCollectionDays: number
  myIncomingDocuments: number
  startTiles: StartTile[]
  topCustomers: TopCustomer[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1000) {
    return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  return String(n)
}

function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// ─── SVG Pie Chart ────────────────────────────────────────────────────────────
function PieChart({ data }: { data: TopCustomer[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const cx = 110, cy = 110, r = 90
  let cumulativePct = 0

  function polarToCartesian(pct: number) {
    const angle = pct * 2 * Math.PI - Math.PI / 2
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    }
  }

  const slices = data.map((d) => {
    const startPct = cumulativePct
    const pct = d.value / total
    cumulativePct += pct
    const endPct = cumulativePct

    const start = polarToCartesian(startPct)
    const end = polarToCartesian(endPct)
    const largeArc = pct > 0.5 ? 1 : 0

    return {
      ...d,
      pct,
      path: `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`,
    }
  })

  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      {slices.map((s, i) => (
        <path
          key={i}
          d={s.path}
          fill={s.color}
          stroke="#0d0e24"
          strokeWidth="2"
          className="hover:opacity-90 transition-opacity cursor-pointer"
        />
      ))}
      {/* Center hole */}
      <circle cx={cx} cy={cy} r={42} fill="#0d0e24" />
      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-white/60" fontSize="9" fontFamily="sans-serif">
        TOP 5
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" className="fill-white/40" fontSize="8" fontFamily="sans-serif">
        CUSTOMERS
      </text>
    </svg>
  )
}

// ─── Activity Tile ────────────────────────────────────────────────────────────
function ActivityTile({
  label,
  value,
  href,
  overdue = false,
  neutral = false,
}: {
  label: string
  value: string | number
  href?: string
  overdue?: boolean
  neutral?: boolean
}) {
  const bg = neutral
    ? 'bg-zinc-700/60'
    : overdue
    ? 'bg-gradient-to-br from-teal-700 to-teal-800'
    : 'bg-gradient-to-br from-teal-600 to-blue-700'

  const inner = (
    <div
      className={`relative rounded-lg flex flex-col items-start justify-between p-4 min-h-[100px] cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-lg ${bg}`}
      style={{ border: overdue ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Red progress bar at top for overdue */}
      {overdue && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500 rounded-t-lg" />
      )}

      {/* Icon area */}
      <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center mb-2">
        <FileText className="w-4 h-4 text-white" />
      </div>

      {/* Value */}
      <span
        className="text-[28px] font-extrabold text-white leading-none mt-auto"
        style={{ color: overdue ? '#fca5a5' : 'white' }}
      >
        {value}
      </span>

      {/* Label */}
      <span className="text-[10px] text-white/70 mt-1 leading-tight">{label}</span>
    </div>
  )

  if (href) return <Link href={href}>{inner}</Link>
  return inner
}

// ─── Start Tile ───────────────────────────────────────────────────────────────
function StartTile({ label, icon, href }: StartTile) {
  const iconMap: Record<string, React.ReactNode> = {
    'user-plus':     <UserPlus className="w-5 h-5 text-white" />,
    'shopping-cart': <ShoppingCart className="w-5 h-5 text-white" />,
    'file-text':     <FileText className="w-5 h-5 text-white" />,
    'package':       <Package className="w-5 h-5 text-white" />,
  }

  return (
    <Link href={href}>
      <div
        className="rounded-lg flex flex-col items-center justify-center gap-3 p-5 min-h-[110px] cursor-pointer transition-all hover:scale-[1.03] hover:shadow-lg bg-gradient-to-br from-teal-600 to-teal-700"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          {iconMap[icon] ?? <LayoutGrid className="w-5 h-5 text-white" />}
        </div>
        <span className="text-[11px] font-medium text-white/90 text-center leading-tight">{label}</span>
      </div>
    </Link>
  )
}

// ─── Collapsible Section ──────────────────────────────────────────────────────
function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 mb-4 group"
      >
        <h2 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
          {title}
        </h2>
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </button>
      {open && children}
    </section>
  )
}

// ─── MOCK FALLBACK ────────────────────────────────────────────────────────────
const MOCK: FinancialsData = {
  salesQuotes: 2,
  salesOrders: 4,
  salesInvoices: 7,
  salesThisMonth: 1906,
  purchaseOrders: 4,
  ongoingPurchaseInvoices: 3,
  overduePurchInvoiceAmount: 49422,
  purchInvoicesDueNextWeek: 0,
  overdueSalesInvoiceAmount: 63890,
  unprocessedPayments: 1,
  avgCollectionDays: 0.0,
  myIncomingDocuments: 0,
  startTiles: [
    { label: 'New Customer',       icon: 'user-plus',     href: '/customers/new' },
    { label: 'New Sales Order',    icon: 'shopping-cart', href: '/sales/orders/new' },
    { label: 'New Sales Invoice',  icon: 'file-text',     href: '/sales/invoices/new' },
    { label: 'New Purchase Order', icon: 'package',       href: '/purchasing/new' },
  ],
  topCustomers: [
    { name: 'Litware Inc.',        value: 48200, color: '#3b82f6' },
    { name: 'Coho Winery',         value: 35600, color: '#ef4444' },
    { name: 'Relecloud',           value: 27900, color: '#10b981' },
    { name: 'Alpine Ski House',    value: 19400, color: '#8b5cf6' },
    { name: 'Trey Research',       value: 14100, color: '#0097b2' },
    { name: 'All Other Customers', value: 9800,  color: '#f59e0b' },
  ],
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FinancialsPage() {
  const [data, setData] = useState<FinancialsData>(MOCK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/financials')
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch(() => {/* keep MOCK */})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <TopBar
        title="Business Manager"
        breadcrumb={[{ label: 'Home', href: '/dashboard' }]}
      />

      <main
        className="flex-1 overflow-auto"
        style={{ background: '#0d0e24', minHeight: 'min-h-[100dvh]' }}
      >
        {/* ── Left sidebar + main two-column layout ───────────────────────── */}
        <div className="flex min-h-[100dvh]">

          {/* ── Narrow left sidebar ─────────────────────────────────────── */}
          <aside
            className="hidden lg:flex flex-col gap-1 shrink-0 pt-6 px-3 pb-4"
            style={{
              width: 200,
              background: '#0f1230',
              borderRight: '1px solid rgba(99,102,241,0.12)',
            }}
          >
            <p className="text-[9px] font-semibold text-indigo-400 uppercase tracking-widest mb-3 px-2">
              Navigate
            </p>
            {[
              { label: 'Customers', href: '/customers',  Icon: Users },
              { label: 'Vendors',   href: '/vendors',    Icon: Building2 },
              { label: 'Items',     href: '/products',   Icon: Package },
            ].map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </Link>
            ))}
          </aside>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-0">

            {/* Center column */}
            <div className="flex-1 min-w-0 px-6 py-6 space-y-8">

              {/* Company header */}
              <div>
                <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-0.5">
                  Business Manager
                </p>
                <h1 className="text-xl font-bold text-white">NovaPOS Demo Co.</h1>
              </div>

              {/* ── ACTIVITIES ─────────────────────────────────────────── */}
              <Section title="Activities">
                <div className="space-y-4">

                  {/* Row label: Ongoing Sales */}
                  <div>
                    <p className="text-[9px] font-semibold text-white/40 uppercase tracking-widest mb-2">
                      Ongoing Sales
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <ActivityTile label="Quotes"         value={data.salesQuotes}    href="/quotes" />
                      <ActivityTile label="Orders"         value={data.salesOrders}    href="/sales/orders" />
                      <ActivityTile label="Invoices"       value={data.salesInvoices}  href="/sales/invoices" />
                      <ActivityTile label="Sales This Month" value={`$${data.salesThisMonth.toLocaleString()}`} href="/sales" />
                    </div>
                  </div>

                  {/* Row label: Purchases */}
                  <div>
                    <p className="text-[9px] font-semibold text-white/40 uppercase tracking-widest mb-2">
                      Purchases
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <ActivityTile label="Purchase Orders"             value={data.purchaseOrders}           href="/purchasing" />
                      <ActivityTile label="Ongoing Purchase Invoices"   value={data.ongoingPurchaseInvoices}  href="/purchasing/invoices" />
                      <ActivityTile
                        label="Overdue Purch. Invoice Amount"
                        value={`$${data.overduePurchInvoiceAmount.toLocaleString()}`}
                        href="/purchasing/invoices"
                        overdue
                      />
                      <ActivityTile label="Purch. Invoices Due Next Week" value={data.purchInvoicesDueNextWeek} href="/purchasing/invoices" />
                    </div>
                  </div>

                  {/* Row label: Payments + Incoming Documents */}
                  <div>
                    <p className="text-[9px] font-semibold text-white/40 uppercase tracking-widest mb-2">
                      Payments &amp; Incoming Documents
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <ActivityTile
                        label="Overdue Sales Invoice Amount"
                        value={`$${data.overdueSalesInvoiceAmount.toLocaleString()}`}
                        href="/sales/invoices"
                        overdue
                      />
                      <ActivityTile label="Unprocessed Payments"     value={data.unprocessedPayments}  href="/bank" />
                      <ActivityTile
                        label="Average Collection Days"
                        value={data.avgCollectionDays.toFixed(1)}
                        neutral
                      />
                      <ActivityTile label="My Incoming Documents"    value={data.myIncomingDocuments}  href="/incoming-documents" />
                    </div>
                  </div>

                </div>
              </Section>

              {/* ── START ──────────────────────────────────────────────── */}
              <Section title="Start">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {data.startTiles.map((t) => (
                    <StartTile key={t.label} {...t} />
                  ))}
                </div>
              </Section>

            </div>

            {/* ── Right panel ─────────────────────────────────────────── */}
            <aside
              className="shrink-0 px-5 py-6"
              style={{
                width: 340,
                background: '#0f1230',
                borderLeft: '1px solid rgba(99,102,241,0.12)',
              }}
            >
              <Section title="Business Assistance">

                {/* Pie chart */}
                <div
                  className="rounded-lg p-4 mb-5"
                  style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}
                >
                  <p className="text-[10px] font-semibold text-white/50 mb-4">
                    Top Five Customers by Sales Value
                  </p>

                  <div className="flex flex-col items-center gap-4">
                    <PieChart data={data.topCustomers} />

                    {/* Legend */}
                    <div className="w-full space-y-1.5">
                      {data.topCustomers.map((c) => (
                        <div key={c.name} className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: c.color }}
                          />
                          <span className="text-[11px] text-white/70 flex-1 truncate">{c.name}</span>
                          <span className="text-[11px] text-white/40 shrink-0">
                            {fmtCurrency(c.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick nav links */}
                <div className="space-y-1">
                  {[
                    { label: 'View All Customers',      href: '/customers' },
                    { label: 'Sales Analysis Report',   href: '/reports' },
                    { label: 'Customer Aging Report',   href: '/reports' },
                  ].map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors py-0.5"
                    >
                      <ChevronRight className="w-3 h-3 shrink-0" />
                      {label}
                    </Link>
                  ))}
                </div>

              </Section>
            </aside>

          </div>
        </div>
      </main>
    </>
  )
}
