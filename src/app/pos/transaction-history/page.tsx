import { TopBar } from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

// ─── Types ─────────────────────────────────────────────────────────────────────
type TenderType = 'Cash' | 'Card' | 'Gift Card' | 'Split'
type TxnStatus = 'Complete' | 'Void' | 'Return' | 'Suspended'
type TxnType = 'Sale' | 'Return' | 'Void' | 'Exchange'

interface LineItem {
  name: string
  qty: number
  unitPrice: number
  discount: number
}

interface PaymentLine {
  tender: TenderType
  amount: number
}

interface Transaction {
  id: string
  dateTime: string
  store: string
  register: string
  cashier: string
  customer: string
  items: number
  subtotal: number
  tax: number
  total: number
  tender: TenderType
  status: TxnStatus
  type: TxnType
  lineItems: LineItem[]
  payments: PaymentLine[]
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-0048291', dateTime: 'Apr 22, 2026 · 4:52 PM', store: 'Downtown Flagship', register: 'Register 06', cashier: 'M. Robinson',
    customer: 'Elena Hartley', items: 3, subtotal: 299.97, tax: 24.75, total: 324.72, tender: 'Card', status: 'Complete', type: 'Sale',
    lineItems: [
      { name: 'Linen Blazer — Sand (M)',     qty: 1, unitPrice: 189.99, discount: 0     },
      { name: 'Cotton Crew Tee — White (M)', qty: 2, unitPrice: 34.99,  discount: 5.00  },
    ],
    payments: [{ tender: 'Card', amount: 324.72 }],
  },
  {
    id: 'TXN-0048290', dateTime: 'Apr 22, 2026 · 4:41 PM', store: 'Downtown Flagship', register: 'Register 01', cashier: 'J. Martinez',
    customer: 'Guest', items: 1, subtotal: 89.99, tax: 7.43, total: 97.42, tender: 'Cash', status: 'Complete', type: 'Sale',
    lineItems: [{ name: 'Canvas Sneaker — White (10)', qty: 1, unitPrice: 89.99, discount: 0 }],
    payments: [{ tender: 'Cash', amount: 97.42 }],
  },
  {
    id: 'TXN-0048289', dateTime: 'Apr 22, 2026 · 4:33 PM', store: 'Midtown Gallery', register: 'Register 02', cashier: 'T. Johnson',
    customer: 'Marcus Webb', items: 2, subtotal: 194.98, tax: 16.09, total: 211.07, tender: 'Card', status: 'Complete', type: 'Sale',
    lineItems: [
      { name: 'Leather Loafer — Cognac (9)', qty: 1, unitPrice: 224.99, discount: 30.00 },
      { name: 'Woven Belt — Tan',            qty: 1, unitPrice: 39.99,  discount: 0     },
    ],
    payments: [{ tender: 'Card', amount: 211.07 }],
  },
  {
    id: 'TXN-0048288', dateTime: 'Apr 22, 2026 · 4:21 PM', store: 'Downtown Flagship', register: 'Register 04', cashier: 'A. Patel',
    customer: 'Guest', items: 4, subtotal: 139.96, tax: 11.55, total: 151.51, tender: 'Gift Card', status: 'Complete', type: 'Sale',
    lineItems: [
      { name: 'Cotton Crew Tee — Navy (L)',  qty: 2, unitPrice: 34.99,  discount: 0 },
      { name: 'Chino Shorts — Olive (32)',   qty: 2, unitPrice: 34.99,  discount: 0 },
    ],
    payments: [{ tender: 'Gift Card', amount: 151.51 }],
  },
  {
    id: 'TXN-0048287', dateTime: 'Apr 22, 2026 · 4:09 PM', store: 'Westfield Mall', register: 'Register 01', cashier: 'P. Nair',
    customer: 'Sofia Reyes', items: 1, subtotal: 179.99, tax: 14.85, total: 194.84, tender: 'Card', status: 'Return', type: 'Return',
    lineItems: [{ name: 'Structured Tote — Camel', qty: 1, unitPrice: 179.99, discount: 0 }],
    payments: [{ tender: 'Card', amount: -194.84 }],
  },
  {
    id: 'TXN-0048286', dateTime: 'Apr 22, 2026 · 3:58 PM', store: 'Downtown Flagship', register: 'Register 01', cashier: 'J. Martinez',
    customer: 'Guest', items: 2, subtotal: 0, tax: 0, total: 0, tender: 'Cash', status: 'Void', type: 'Void',
    lineItems: [{ name: 'Merino Knit Sweater (S)', qty: 1, unitPrice: 149.99, discount: 0 }],
    payments: [],
  },
  {
    id: 'TXN-0048285', dateTime: 'Apr 22, 2026 · 3:47 PM', store: 'Lakewood Center', register: 'Register 03', cashier: 'R. Choi',
    customer: 'David Park Jr.', items: 5, subtotal: 524.95, tax: 43.31, total: 568.26, tender: 'Split', status: 'Complete', type: 'Sale',
    lineItems: [
      { name: 'Wool Overcoat — Camel (M)', qty: 1, unitPrice: 349.99, discount: 0    },
      { name: 'Merino Knit Sweater (M)',   qty: 1, unitPrice: 149.99, discount: 0    },
      { name: 'Woven Belt — Tan',          qty: 1, unitPrice: 39.99,  discount: 15.02},
    ],
    payments: [{ tender: 'Card', amount: 400.00 }, { tender: 'Gift Card', amount: 168.26 }],
  },
  {
    id: 'TXN-0048284', dateTime: 'Apr 22, 2026 · 3:38 PM', store: 'North Shore Centre', register: 'Register 02', cashier: 'S. Kim',
    customer: 'Priya Mehta', items: 1, subtotal: 54.99, tax: 4.54, total: 59.53, tender: 'Card', status: 'Complete', type: 'Sale',
    lineItems: [{ name: 'Straw Hat — Natural', qty: 1, unitPrice: 54.99, discount: 0 }],
    payments: [{ tender: 'Card', amount: 59.53 }],
  },
  {
    id: 'TXN-0048283', dateTime: 'Apr 22, 2026 · 3:27 PM', store: 'Downtown Flagship', register: 'Register 02', cashier: 'T. Johnson',
    customer: 'Guest', items: 3, subtotal: 219.97, tax: 18.15, total: 238.12, tender: 'Cash', status: 'Complete', type: 'Sale',
    lineItems: [
      { name: 'Leather Cardholder — Black', qty: 1, unitPrice: 29.99,  discount: 0 },
      { name: 'Canvas Sneaker — White (9)', qty: 1, unitPrice: 89.99,  discount: 0 },
      { name: 'Linen Trousers — Cream (32)',qty: 1, unitPrice: 119.99, discount: 20.00},
    ],
    payments: [{ tender: 'Cash', amount: 238.12 }],
  },
  {
    id: 'TXN-0048282', dateTime: 'Apr 22, 2026 · 3:15 PM', store: 'Union Square Outlet', register: 'Register 05', cashier: 'M. Chen',
    customer: 'Guest', items: 2, subtotal: 309.98, tax: 25.57, total: 335.55, tender: 'Card', status: 'Complete', type: 'Sale',
    lineItems: [
      { name: 'Suede Chelsea Boot (8)',     qty: 1, unitPrice: 269.99, discount: 0 },
      { name: 'Woven Belt — Tan',           qty: 1, unitPrice: 39.99,  discount: 0 },
    ],
    payments: [{ tender: 'Card', amount: 335.55 }],
  },
  {
    id: 'TXN-0048281', dateTime: 'Apr 22, 2026 · 3:02 PM', store: 'Riverside Plaza', register: 'Register 01', cashier: 'M. Silva',
    customer: 'Tom Barnes', items: 1, subtotal: 224.99, tax: 18.56, total: 243.55, tender: 'Card', status: 'Return', type: 'Return',
    lineItems: [{ name: 'Leather Loafer — Cognac (10)', qty: 1, unitPrice: 224.99, discount: 0 }],
    payments: [{ tender: 'Card', amount: -243.55 }],
  },
  {
    id: 'TXN-0048280', dateTime: 'Apr 22, 2026 · 2:51 PM', store: 'Downtown Flagship', register: 'Register 06', cashier: 'M. Robinson',
    customer: 'Alexa Nguyen', items: 4, subtotal: 444.96, tax: 36.71, total: 481.67, tender: 'Split', status: 'Complete', type: 'Sale',
    lineItems: [
      { name: 'Mule Sandal — Blush (7)',    qty: 1, unitPrice: 99.99,  discount: 0 },
      { name: 'Crossbody Bag — Terracotta', qty: 1, unitPrice: 139.99, discount: 10.00},
      { name: 'Cotton Crew Tee — White (S)',qty: 2, unitPrice: 34.99,  discount: 0 },
    ],
    payments: [{ tender: 'Card', amount: 300.00 }, { tender: 'Cash', amount: 181.67 }],
  },
  {
    id: 'TXN-0048279', dateTime: 'Apr 22, 2026 · 2:40 PM', store: 'Midtown Gallery', register: 'Register 01', cashier: 'J. Okafor',
    customer: 'Guest', items: 1, subtotal: 349.99, tax: 28.87, total: 378.86, tender: 'Card', status: 'Complete', type: 'Sale',
    lineItems: [{ name: 'Wool Overcoat — Camel (L)', qty: 1, unitPrice: 349.99, discount: 0 }],
    payments: [{ tender: 'Card', amount: 378.86 }],
  },
  {
    id: 'TXN-0048278', dateTime: 'Apr 22, 2026 · 2:27 PM', store: 'Southgate Square', register: 'Register 02', cashier: 'T. Brooks',
    customer: 'Guest', items: 2, subtotal: 64.98, tax: 5.36, total: 70.34, tender: 'Cash', status: 'Complete', type: 'Sale',
    lineItems: [
      { name: 'Seersucker Shorts — Navy (34)', qty: 1, unitPrice: 59.99, discount: 0 },
      { name: 'Leather Cardholder — Black',   qty: 1, unitPrice: 29.99, discount: 25.00},
    ],
    payments: [{ tender: 'Cash', amount: 70.34 }],
  },
  {
    id: 'TXN-0048277', dateTime: 'Apr 22, 2026 · 2:15 PM', store: 'Downtown Flagship', register: 'Register 04', cashier: 'A. Patel',
    customer: 'Chris Olsen', items: 3, subtotal: 329.97, tax: 27.22, total: 357.19, tender: 'Card', status: 'Complete', type: 'Sale',
    lineItems: [
      { name: 'Linen Blazer — Sand (L)',     qty: 1, unitPrice: 189.99, discount: 0 },
      { name: 'Poplin Shirt — Blue Stripe (L)',qty: 1, unitPrice: 79.99, discount: 0 },
      { name: 'Woven Belt — Tan',            qty: 1, unitPrice: 39.99,  discount: 0 },
    ],
    payments: [{ tender: 'Card', amount: 357.19 }],
  },
  {
    id: 'TXN-0048276', dateTime: 'Apr 22, 2026 · 2:04 PM', store: 'Harbor View', register: 'Register 01', cashier: 'D. Park',
    customer: 'Guest', items: 1, subtotal: 99.99, tax: 8.25, total: 108.24, tender: 'Gift Card', status: 'Complete', type: 'Sale',
    lineItems: [{ name: 'Mule Sandal — Blush (8)', qty: 1, unitPrice: 99.99, discount: 0 }],
    payments: [{ tender: 'Gift Card', amount: 108.24 }],
  },
  {
    id: 'TXN-0048275', dateTime: 'Apr 22, 2026 · 1:52 PM', store: 'Lakewood Center', register: 'Register 01', cashier: 'R. Choi',
    customer: 'Nina Lin', items: 2, subtotal: 0, tax: 0, total: 0, tender: 'Card', status: 'Suspended', type: 'Sale',
    lineItems: [{ name: 'Espadrille Wedge (7)', qty: 1, unitPrice: 79.99, discount: 0 }],
    payments: [],
  },
  {
    id: 'TXN-0048274', dateTime: 'Apr 22, 2026 · 1:38 PM', store: 'Downtown Flagship', register: 'Register 01', cashier: 'J. Martinez',
    customer: 'Guest', items: 1, subtotal: 64.99, tax: 5.36, total: 70.35, tender: 'Cash', status: 'Complete', type: 'Sale',
    lineItems: [{ name: 'Chino Shorts — Olive (34)', qty: 1, unitPrice: 64.99, discount: 0 }],
    payments: [{ tender: 'Cash', amount: 70.35 }],
  },
  {
    id: 'TXN-0048273', dateTime: 'Apr 22, 2026 · 1:27 PM', store: 'Midtown Gallery', register: 'Register 03', cashier: 'T. Johnson',
    customer: 'Zara Obi', items: 3, subtotal: 279.97, tax: 23.10, total: 303.07, tender: 'Card', status: 'Complete', type: 'Exchange',
    lineItems: [
      { name: 'Linen Trousers — Cream (34)', qty: 1, unitPrice: 119.99, discount: 0 },
      { name: 'Cotton Crew Tee — White (M)', qty: 2, unitPrice: 34.99,  discount: 0 },
    ],
    payments: [{ tender: 'Card', amount: 303.07 }],
  },
  {
    id: 'TXN-0048272', dateTime: 'Apr 22, 2026 · 1:14 PM', store: 'Downtown Flagship', register: 'Register 06', cashier: 'M. Robinson',
    customer: 'Ben Carter', items: 2, subtotal: 189.98, tax: 15.67, total: 205.65, tender: 'Split', status: 'Complete', type: 'Sale',
    lineItems: [
      { name: 'Leather Loafer — Cognac (11)', qty: 1, unitPrice: 224.99, discount: 35.00},
      { name: 'Leather Cardholder — Black',  qty: 1, unitPrice: 29.99,  discount: 0    },
    ],
    payments: [{ tender: 'Cash', amount: 100.00 }, { tender: 'Card', amount: 105.65 }],
  },
  {
    id: 'TXN-0048271', dateTime: 'Apr 22, 2026 · 12:59 PM', store: 'North Shore Centre', register: 'Register 04', cashier: 'S. Kim',
    customer: 'Guest', items: 1, subtotal: 269.99, tax: 22.27, total: 292.26, tender: 'Card', status: 'Complete', type: 'Sale',
    lineItems: [{ name: 'Suede Chelsea Boot (9)', qty: 1, unitPrice: 269.99, discount: 0 }],
    payments: [{ tender: 'Card', amount: 292.26 }],
  },
  {
    id: 'TXN-0048270', dateTime: 'Apr 22, 2026 · 12:44 PM', store: 'Westfield Mall', register: 'Register 02', cashier: 'P. Nair',
    customer: 'Ava Scott', items: 4, subtotal: 374.96, tax: 30.93, total: 405.89, tender: 'Card', status: 'Complete', type: 'Sale',
    lineItems: [
      { name: 'Jersey Midi Dress — Sage (S)', qty: 1, unitPrice: 99.99,  discount: 0 },
      { name: 'Crossbody Bag — Terracotta',  qty: 1, unitPrice: 139.99, discount: 0 },
      { name: 'Straw Hat — Natural',         qty: 1, unitPrice: 54.99,  discount: 0 },
      { name: 'Canvas Tote Bag',             qty: 1, unitPrice: 49.99,  discount: 0 },
    ],
    payments: [{ tender: 'Card', amount: 405.89 }],
  },
  {
    id: 'TXN-0048269', dateTime: 'Apr 22, 2026 · 12:30 PM', store: 'Downtown Flagship', register: 'Register 04', cashier: 'A. Patel',
    customer: 'Guest', items: 1, subtotal: 79.99, tax: 6.60, total: 86.59, tender: 'Cash', status: 'Void', type: 'Void',
    lineItems: [{ name: 'Poplin Shirt — Blue Stripe (M)', qty: 1, unitPrice: 79.99, discount: 0 }],
    payments: [],
  },
  {
    id: 'TXN-0048268', dateTime: 'Apr 22, 2026 · 12:15 PM', store: 'Greenwood Village', register: 'Register 02', cashier: 'L. Vasquez',
    customer: 'Ryan Mills', items: 2, subtotal: 119.98, tax: 9.90, total: 129.88, tender: 'Card', status: 'Complete', type: 'Sale',
    lineItems: [
      { name: 'Espadrille Wedge (8)',         qty: 1, unitPrice: 79.99, discount: 0 },
      { name: 'Seersucker Shorts — Navy (30)',qty: 1, unitPrice: 59.99, discount: 20.00},
    ],
    payments: [{ tender: 'Card', amount: 129.88 }],
  },
  {
    id: 'TXN-0048267', dateTime: 'Apr 22, 2026 · 12:02 PM', store: 'Downtown Flagship', register: 'Register 02', cashier: 'T. Johnson',
    customer: 'Luis Morales', items: 3, subtotal: 404.97, tax: 33.41, total: 438.38, tender: 'Card', status: 'Return', type: 'Return',
    lineItems: [
      { name: 'Wool Overcoat — Camel (M)',   qty: 1, unitPrice: 349.99, discount: 0 },
      { name: 'Poplin Shirt — Blue Stripe (M)',qty: 1, unitPrice: 79.99, discount: 0 },
      { name: 'Leather Cardholder — Black',  qty: -1, unitPrice: 29.99, discount: 0 },
    ],
    payments: [{ tender: 'Card', amount: -438.38 }],
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  const abs = Math.abs(n)
  const s = '$' + abs.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return n < 0 ? `(${s})` : s
}

function tenderChip(t: TenderType) {
  const map: Record<TenderType, string> = {
    'Cash':      'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    'Card':      'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25',
    'Gift Card': 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
    'Split':     'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
  }
  return map[t]
}

function statusChip(s: TxnStatus) {
  const map: Record<TxnStatus, string> = {
    'Complete':  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    'Void':      'bg-red-500/15 text-red-400 border border-red-500/25',
    'Return':    'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    'Suspended': 'bg-zinc-700/60 text-zinc-400 border border-zinc-600/40',
  }
  return map[s]
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function TransactionHistoryPage() {
  const kpis = [
    { label: "Today's Transactions", value: '148',    sub: '+12 vs yesterday',   color: 'text-indigo-400',  icon: 'txn'     },
    { label: "Today's Revenue",      value: '$18,420', sub: '93% of daily target',color: 'text-emerald-400', icon: 'revenue' },
    { label: 'Voids',                value: '3',      sub: '2.0% void rate',     color: 'text-red-400',    icon: 'void'    },
    { label: 'Returns',              value: '8',      sub: '$892 refunded',      color: 'text-amber-400',  icon: 'return'  },
    { label: 'Avg Basket',           value: '$124',   sub: '+$8 vs last week',   color: 'text-cyan-400',   icon: 'avg'     },
  ]

  const expandedTxn = TRANSACTIONS[0]

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0f0f1a', color: '#e4e4ef' }}>
      <TopBar
        title="Transaction History"
        breadcrumb={[{ label: 'POS', href: '/pos' }]}
        actions={
          <>
            <button
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border"
              style={{ borderColor: 'rgba(63,63,70,0.5)', color: '#a1a1aa' }}
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"><path d="M3 4l2 8h6l2-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 4h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M6 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.4"/></svg>
              Export CSV
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
              style={{ background: 'rgba(99,102,241,0.9)', color: '#fff' }}
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Reports
            </button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4 px-6 py-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl p-4" style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider leading-tight">{k.label}</span>
              <TxnKpiIcon type={k.icon} color={k.color} />
            </div>
            <div className={`text-2xl font-bold font-mono ${k.color}`}>{k.value}</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter Strip */}
      <div
        className="mx-6 mb-4 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap"
        style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
      >
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            defaultValue="2026-04-22"
            className="rounded-lg px-3 py-1.5 text-xs border text-zinc-300 focus:outline-none"
            style={{ background: 'rgba(39,39,42,0.6)', borderColor: 'rgba(63,63,70,0.5)' }}
          />
          <span className="text-xs text-zinc-600">—</span>
          <input
            type="date"
            defaultValue="2026-04-22"
            className="rounded-lg px-3 py-1.5 text-xs border text-zinc-300 focus:outline-none"
            style={{ background: 'rgba(39,39,42,0.6)', borderColor: 'rgba(63,63,70,0.5)' }}
          />
        </div>
        <div className="h-5 w-px bg-zinc-700/60" />
        {/* Selectors */}
        {[
          { label: 'All Stores',    opts: ['Downtown Flagship','Midtown Gallery','Westfield Mall'] },
          { label: 'All Registers', opts: ['Register 01','Register 02','Register 03'] },
          { label: 'All Tenders',   opts: ['Cash','Card','Gift Card','Split'] },
        ].map((f) => (
          <select
            key={f.label}
            className="rounded-lg px-3 py-1.5 text-xs border text-zinc-400 focus:outline-none cursor-pointer"
            style={{ background: 'rgba(39,39,42,0.6)', borderColor: 'rgba(63,63,70,0.5)' }}
          >
            <option>{f.label}</option>
            {f.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        {/* Transaction Type Tabs */}
        <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: 'rgba(39,39,42,0.6)' }}>
          {(['All','Sale','Return','Void','Exchange'] as const).map((t, i) => (
            <button
              key={t}
              className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
              style={i === 0 ? { background: 'rgba(99,102,241,0.8)', color: '#fff' } : { color: '#71717a' }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="h-5 w-px bg-zinc-700/60" />
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg viewBox="0 0 16 16" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500">
            <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border text-zinc-300 placeholder-zinc-600 focus:outline-none"
            placeholder="Search receipt, customer…"
            style={{ background: 'rgba(39,39,42,0.6)', borderColor: 'rgba(63,63,70,0.5)' }}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mx-6 mb-4 rounded-xl overflow-hidden" style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(63,63,70,0.5)' }}>
          <span className="text-xs font-semibold text-zinc-300">Today — Apr 22, 2026</span>
          <span className="text-[11px] text-zinc-500">148 transactions · 25 shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
                {['Trans ID','Date/Time','Store','Register','Cashier','Customer','Items','Subtotal','Tax','Total','Tender','Status'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-medium text-zinc-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((txn, i) => (
                <>
                  <tr
                    key={txn.id}
                    className="cursor-pointer transition-colors hover:bg-white/[0.025]"
                    style={{ borderBottom: '1px solid rgba(63,63,70,0.3)' }}
                  >
                    <td className="px-3 py-2.5 font-mono text-indigo-400 whitespace-nowrap">{txn.id}</td>
                    <td className="px-3 py-2.5 text-zinc-400 whitespace-nowrap">{txn.dateTime}</td>
                    <td className="px-3 py-2.5 text-zinc-300 whitespace-nowrap max-w-[120px] truncate">{txn.store}</td>
                    <td className="px-3 py-2.5 text-zinc-400 whitespace-nowrap">{txn.register}</td>
                    <td className="px-3 py-2.5 text-zinc-400 whitespace-nowrap">{txn.cashier}</td>
                    <td className="px-3 py-2.5 text-zinc-300 whitespace-nowrap">{txn.customer}</td>
                    <td className="px-3 py-2.5 font-mono text-zinc-300 text-center">{txn.items}</td>
                    <td className="px-3 py-2.5 font-mono text-zinc-400 whitespace-nowrap">{txn.total === 0 ? '—' : fmt(txn.subtotal)}</td>
                    <td className="px-3 py-2.5 font-mono text-zinc-400 whitespace-nowrap">{txn.total === 0 ? '—' : fmt(txn.tax)}</td>
                    <td className="px-3 py-2.5 font-mono text-zinc-200 font-semibold whitespace-nowrap">{txn.total === 0 ? '—' : fmt(txn.total)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] rounded px-2 py-0.5 font-medium ${tenderChip(txn.tender)}`}>{txn.tender}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] rounded px-2 py-0.5 font-medium ${statusChip(txn.status)}`}>{txn.status}</span>
                    </td>
                  </tr>
                  {/* Expanded accordion — shown for first row as demo */}
                  {i === 0 && (
                    <tr key={`${txn.id}-expand`}>
                      <td colSpan={12} className="px-0" style={{ background: 'rgba(99,102,241,0.04)', borderBottom: '1px solid rgba(63,63,70,0.4)' }}>
                        <div className="px-6 py-4 grid grid-cols-2 gap-6">
                          {/* Receipt Preview */}
                          <div>
                            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Receipt — Line Items</div>
                            <table className="w-full text-xs">
                              <thead>
                                <tr>
                                  {['Product','Qty','Unit Price','Disc.','Ext. Price'].map(h => (
                                    <th key={h} className="text-left py-1 text-[10px] font-medium text-zinc-600">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {expandedTxn.lineItems.map((li, li_i) => (
                                  <tr key={li_i} className="border-t" style={{ borderColor: 'rgba(63,63,70,0.3)' }}>
                                    <td className="py-1.5 text-zinc-300">{li.name}</td>
                                    <td className="py-1.5 font-mono text-zinc-400 text-center">{li.qty}</td>
                                    <td className="py-1.5 font-mono text-zinc-400">{fmt(li.unitPrice)}</td>
                                    <td className="py-1.5 font-mono text-red-400">{li.discount > 0 ? `-${fmt(li.discount)}` : '—'}</td>
                                    <td className="py-1.5 font-mono text-zinc-200 font-medium">{fmt(li.qty * li.unitPrice - li.discount)}</td>
                                  </tr>
                                ))}
                                <tr className="border-t" style={{ borderColor: 'rgba(99,102,241,0.25)' }}>
                                  <td colSpan={4} className="py-1.5 text-right text-zinc-400 pr-2 font-medium">Subtotal</td>
                                  <td className="py-1.5 font-mono text-zinc-200">{fmt(expandedTxn.subtotal)}</td>
                                </tr>
                                <tr>
                                  <td colSpan={4} className="py-0.5 text-right text-zinc-500 pr-2">Tax (8.25%)</td>
                                  <td className="py-0.5 font-mono text-zinc-400">{fmt(expandedTxn.tax)}</td>
                                </tr>
                                <tr>
                                  <td colSpan={4} className="py-1.5 text-right text-zinc-200 pr-2 font-semibold">Total</td>
                                  <td className="py-1.5 font-mono text-zinc-100 font-bold">{fmt(expandedTxn.total)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          {/* Right: Payments + Actions */}
                          <div className="flex flex-col gap-4">
                            <div>
                              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Payment Breakdown</div>
                              {expandedTxn.payments.map((p, pi) => (
                                <div key={pi} className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: 'rgba(63,63,70,0.3)' }}>
                                  <span className={`text-[10px] rounded px-2 py-0.5 font-medium ${tenderChip(p.tender)}`}>{p.tender}</span>
                                  <span className="font-mono text-sm text-zinc-200 font-semibold">{fmt(p.amount)}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Actions</div>
                              <div className="flex flex-wrap gap-2">
                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                                  Void Transaction
                                </button>
                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors">
                                  Return Items
                                </button>
                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-600/50 text-zinc-300 hover:bg-white/[0.05] transition-colors">
                                  Print Receipt
                                </button>
                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                                  Email Receipt
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: 'rgba(63,63,70,0.5)' }}>
          <span className="text-xs text-zinc-500">Showing 1–25 of 148</span>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5,6].map((p) => (
              <button
                key={p}
                className="w-7 h-7 rounded-lg text-xs font-medium transition-colors"
                style={p === 1
                  ? { background: 'rgba(99,102,241,0.8)', color: '#fff' }
                  : { color: '#71717a' }
                }
              >
                {p}
              </button>
            ))}
            <span className="px-2 text-zinc-600 text-xs">…</span>
            <button className="px-3 h-7 rounded-lg text-xs font-medium text-zinc-400 border" style={{ borderColor: 'rgba(63,63,70,0.4)' }}>Next</button>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── KPI Icon ──────────────────────────────────────────────────────────────────
function TxnKpiIcon({ type, color }: { type: string; color: string }) {
  const bg = color.includes('indigo')  ? 'rgba(99,102,241,0.15)'
    : color.includes('emerald') ? 'rgba(52,211,153,0.15)'
    : color.includes('red')     ? 'rgba(239,68,68,0.15)'
    : color.includes('amber')   ? 'rgba(245,158,11,0.15)'
    : 'rgba(34,211,238,0.15)'

  const icons: Record<string, JSX.Element> = {
    txn:     <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    revenue: <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M2 12l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    void:    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    return:  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M4 5l-2 2 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 7h9a3 3 0 010 6H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    avg:     <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M3 8h10M8 3l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  }

  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
      <span className={color}>{icons[type]}</span>
    </div>
  )
}
