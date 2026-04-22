import { TopBar } from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Store {
  id: string
  name: string
  number: string
  address: string
  city: string
  state: string
  phone: string
  manager: string
  status: 'Open' | 'Closed'
  hours: string
  todaySales: number
  salesTarget: number
  staffOnShift: number
  registerCount: number
  alerts: number
}

interface Register {
  id: string
  name: string
  status: 'Online' | 'Offline' | 'Suspended'
  cashier: string
  transactions: number
}

interface StaffMember {
  id: string
  name: string
  role: string
  clockIn: string
}

interface AlertItem {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  time: string
}

interface LowStockItem {
  sku: string
  name: string
  qty: number
  reorderPoint: number
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const STORES: Store[] = [
  { id: 's01', name: 'Downtown Flagship',    number: '001', address: '100 Main St',        city: 'Chicago',     state: 'IL', phone: '(312) 555-0100', manager: 'Angela Torres',   status: 'Open',   hours: '9am–9pm', todaySales: 12840, salesTarget: 15000, staffOnShift: 8,  registerCount: 6, alerts: 2 },
  { id: 's02', name: 'Midtown Gallery',      number: '002', address: '250 5th Ave',        city: 'New York',    state: 'NY', phone: '(212) 555-0202', manager: 'James Okafor',    status: 'Open',   hours: '10am–8pm',todaySales: 9320,  salesTarget: 10000, staffOnShift: 6,  registerCount: 4, alerts: 0 },
  { id: 's03', name: 'Westfield Mall',       number: '003', address: '3000 W 31st St',     city: 'Los Angeles', state: 'CA', phone: '(213) 555-0303', manager: 'Priya Nair',      status: 'Open',   hours: '10am–9pm',todaySales: 7510,  salesTarget: 9000,  staffOnShift: 5,  registerCount: 4, alerts: 1 },
  { id: 's04', name: 'Riverside Plaza',      number: '004', address: '88 Riverside Dr',    city: 'Austin',      state: 'TX', phone: '(512) 555-0404', manager: 'Marco Silva',     status: 'Open',   hours: '9am–8pm', todaySales: 4820,  salesTarget: 6000,  staffOnShift: 4,  registerCount: 3, alerts: 0 },
  { id: 's05', name: 'North Shore Centre',   number: '005', address: '450 Lake Shore',     city: 'Chicago',     state: 'IL', phone: '(312) 555-0505', manager: 'Sarah Kim',       status: 'Open',   hours: '10am–9pm',todaySales: 6180,  salesTarget: 7500,  staffOnShift: 5,  registerCount: 4, alerts: 1 },
  { id: 's06', name: 'Harbor View',          number: '006', address: '12 Harbor Blvd',     city: 'San Diego',   state: 'CA', phone: '(619) 555-0606', manager: 'David Park',      status: 'Open',   hours: '9am–8pm', todaySales: 3990,  salesTarget: 5000,  staffOnShift: 3,  registerCount: 2, alerts: 0 },
  { id: 's07', name: 'Southgate Square',     number: '007', address: '700 South Pkwy',     city: 'Atlanta',     state: 'GA', phone: '(404) 555-0707', manager: 'Tanya Brooks',    status: 'Open',   hours: '10am–8pm',todaySales: 4500,  salesTarget: 5500,  staffOnShift: 4,  registerCount: 3, alerts: 0 },
  { id: 's08', name: 'Greenwood Village',    number: '008', address: '55 Greenwood Ave',   city: 'Denver',      state: 'CO', phone: '(303) 555-0808', manager: 'Leo Vasquez',     status: 'Open',   hours: '9am–7pm', todaySales: 2960,  salesTarget: 4000,  staffOnShift: 3,  registerCount: 2, alerts: 0 },
  { id: 's09', name: 'Eastpoint Mall',       number: '009', address: '900 East Blvd',      city: 'Charlotte',   state: 'NC', phone: '(704) 555-0909', manager: 'Nina Washington',  status: 'Closed', hours: '10am–9pm',todaySales: 0,     salesTarget: 5000,  staffOnShift: 0,  registerCount: 3, alerts: 1 },
  { id: 's10', name: 'Lakewood Center',      number: '010', address: '1200 Lakeview Rd',   city: 'Seattle',     state: 'WA', phone: '(206) 555-1010', manager: 'Ryan Choi',       status: 'Open',   hours: '9am–8pm', todaySales: 5120,  salesTarget: 6500,  staffOnShift: 5,  registerCount: 4, alerts: 0 },
  { id: 's11', name: 'Union Square Outlet',  number: '011', address: '333 Union St',       city: 'San Francisco',state: 'CA',phone: '(415) 555-1111', manager: 'Mia Chen',        status: 'Open',   hours: '10am–8pm',todaySales: 8400,  salesTarget: 9000,  staffOnShift: 6,  registerCount: 5, alerts: 0 },
  { id: 's12', name: 'Maple Grove',          number: '012', address: '20 Maple Grove Ln',  city: 'Minneapolis', state: 'MN', phone: '(612) 555-1212', manager: 'Chris Olsen',     status: 'Closed', hours: '9am–7pm', todaySales: 0,     salesTarget: 3500,  staffOnShift: 0,  registerCount: 2, alerts: 0 },
]

const REGISTERS: Register[] = [
  { id: 'r1', name: 'Register 01', status: 'Online',    cashier: 'J. Martinez',   transactions: 42 },
  { id: 'r2', name: 'Register 02', status: 'Online',    cashier: 'T. Johnson',    transactions: 38 },
  { id: 'r3', name: 'Register 03', status: 'Suspended', cashier: '—',             transactions: 0  },
  { id: 'r4', name: 'Register 04', status: 'Online',    cashier: 'A. Patel',      transactions: 29 },
  { id: 'r5', name: 'Register 05', status: 'Offline',   cashier: '—',             transactions: 0  },
  { id: 'r6', name: 'Register 06', status: 'Online',    cashier: 'M. Robinson',   transactions: 51 },
]

const STAFF: StaffMember[] = [
  { id: 'e1', name: 'Javier Martinez',  role: 'Sales Associate',  clockIn: '8:55 AM' },
  { id: 'e2', name: 'Tiana Johnson',    role: 'Sales Associate',  clockIn: '9:02 AM' },
  { id: 'e3', name: 'Angela Torres',    role: 'Store Manager',    clockIn: '8:30 AM' },
  { id: 'e4', name: 'Amir Patel',       role: 'Shift Supervisor', clockIn: '9:00 AM' },
  { id: 'e5', name: 'Marcus Robinson',  role: 'Sales Associate',  clockIn: '9:10 AM' },
  { id: 'e6', name: 'Sofia Cruz',       role: 'Cashier',          clockIn: '9:05 AM' },
  { id: 'e7', name: 'Derek Hill',       role: 'Stock Associate',  clockIn: '8:45 AM' },
  { id: 'e8', name: 'Yuki Tanaka',      role: 'Sales Associate',  clockIn: '9:15 AM' },
]

const STORE_ALERTS: AlertItem[] = [
  { id: 'a1', type: 'error',   message: 'Register 03 paper jam — requires attention',      time: '11:42 AM' },
  { id: 'a2', type: 'warning', message: 'Cash drawer over threshold — schedule cash drop',  time: '10:15 AM' },
]

const LOW_STOCK: LowStockItem[] = [
  { sku: 'APP-2026-001', name: 'Linen Blazer — Sand (M)',   qty: 2,  reorderPoint: 5 },
  { sku: 'SHO-2026-033', name: 'Leather Loafer Cognac (10)',qty: 1,  reorderPoint: 4 },
  { sku: 'ACC-2026-022', name: 'Leather Cardholder Black',  qty: 3,  reorderPoint: 10 },
  { sku: 'APP-2026-014', name: 'Chino Shorts Olive (32)',   qty: 0,  reorderPoint: 6 },
  { sku: 'SHO-2026-041', name: 'Suede Chelsea Boot (9)',    qty: 2,  reorderPoint: 5 },
]

const HOURLY_SALES = [820, 1140, 980, 1320, 1680, 1540, 1920, 2100, 880, 460]
const HOURS = ['8a','9a','10a','11a','12p','1p','2p','3p','4p','5p']
const MAX_HOURLY = Math.max(...HOURLY_SALES)

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
function fmtFull(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function salesPct(store: Store) {
  if (store.salesTarget === 0) return 0
  return Math.min(100, Math.round((store.todaySales / store.salesTarget) * 100))
}

function regStatusColor(s: Register['status']) {
  return s === 'Online' ? 'text-emerald-400 bg-emerald-500/15' : s === 'Suspended' ? 'text-amber-400 bg-amber-500/15' : 'text-zinc-400 bg-zinc-700/50'
}

function alertTypeColor(t: AlertItem['type']) {
  return t === 'error' ? 'text-red-400 bg-red-500/10 border-red-500/20' : t === 'warning' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function StoreManagementPage() {
  const kpis = [
    { label: 'Total Stores',        value: '12',    sub: '2 regions',             color: 'text-indigo-400',  icon: 'stores'  },
    { label: 'Active',              value: '10',    sub: '2 inactive',             color: 'text-emerald-400', icon: 'active'  },
    { label: 'Open Now',            value: '8',     sub: '4 closed',               color: 'text-cyan-400',   icon: 'open'    },
    { label: 'Top Store Revenue',   value: '$48,320', sub: 'Downtown Flagship/day', color: 'text-amber-400',  icon: 'revenue' },
    { label: 'Avg Transaction',     value: '$127',  sub: 'across all stores',      color: 'text-violet-400', icon: 'avg'     },
  ]

  const detailStore = STORES[0]
  const pct = salesPct(detailStore)

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0f0f1a', color: '#e4e4ef' }}>
      <TopBar
        title="Store Management"
        breadcrumb={[{ label: 'Retail', href: '/retail' }]}
        actions={
          <>
            <button
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border"
              style={{ borderColor: 'rgba(99,102,241,0.35)', color: '#a5b4fc', background: 'rgba(99,102,241,0.08)' }}
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              New Store
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border"
              style={{ borderColor: 'rgba(63,63,70,0.5)', color: '#a1a1aa' }}
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Export
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
              <StoreKpiIcon type={k.icon} color={k.color} />
            </div>
            <div className={`text-2xl font-bold font-mono ${k.color}`}>{k.value}</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 gap-0 px-6 pb-6 overflow-hidden">

        {/* Store Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-4">
          <div className="grid grid-cols-3 gap-4">
            {STORES.map((store) => {
              const pct = salesPct(store)
              return (
                <div
                  key={store.id}
                  className="rounded-xl p-4 cursor-pointer hover:border-indigo-500/30 transition-colors"
                  style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-zinc-100">{store.name}</span>
                        {store.alerts > 0 && (
                          <span className="text-[10px] rounded-full px-1.5 py-0.5 bg-red-500/15 text-red-400 border border-red-500/20 font-medium">
                            {store.alerts} alert{store.alerts > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500">{store.city}, {store.state} · #{store.number}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: store.status === 'Open' ? '#34d399' : '#52525b' }}
                      />
                      <span className={`text-[11px] font-medium ${store.status === 'Open' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        {store.status}
                      </span>
                    </div>
                  </div>

                  {/* Sales Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-zinc-400">Today&apos;s Sales</span>
                      <span className="text-[11px] font-mono text-zinc-300">{fmt(store.todaySales)} / {fmt(store.salesTarget)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-700/50">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 80 ? '#34d399' : pct >= 50 ? '#6366f1' : '#f59e0b',
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{pct}% of daily target</div>
                  </div>

                  {/* Card Footer Stats */}
                  <div className="flex items-center gap-4 border-t pt-2.5" style={{ borderColor: 'rgba(63,63,70,0.4)' }}>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 12c0-2.21 2.24-4 5-4s5 1.79 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                      <span>{store.staffOnShift} on shift</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><rect x="2" y="4" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.3"/></svg>
                      <span>{store.registerCount} registers</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 ml-auto">
                      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                      <span>{store.hours}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Detail Panel */}
        <div
          className="shrink-0 rounded-xl flex flex-col overflow-hidden"
          style={{ width: 560, background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
        >
          {/* Panel Header */}
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(63,63,70,0.5)' }}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-base font-semibold text-zinc-100">{detailStore.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Open</span>
              </div>
            </div>
            <div className="text-xs text-zinc-500">{detailStore.address}, {detailStore.city}, {detailStore.state} · #{detailStore.number}</div>
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* FastTab: General */}
            <details open className="border-b" style={{ borderColor: 'rgba(63,63,70,0.4)' }}>
              <summary className="flex items-center justify-between px-5 py-3 cursor-pointer list-none">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">General</span>
                <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5 text-zinc-500"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </summary>
              <div className="px-5 pb-4 grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  { label: 'Address',  value: `${detailStore.address}, ${detailStore.city}, ${detailStore.state}` },
                  { label: 'Phone',    value: detailStore.phone },
                  { label: 'Manager',  value: detailStore.manager },
                  { label: 'Hours',    value: detailStore.hours },
                  { label: 'Store #',  value: detailStore.number },
                  { label: 'Status',   value: detailStore.status },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">{row.label}</div>
                    <div className="text-xs text-zinc-300">{row.value}</div>
                  </div>
                ))}
              </div>
            </details>

            {/* FastTab: POS Registers */}
            <details open className="border-b" style={{ borderColor: 'rgba(63,63,70,0.4)' }}>
              <summary className="flex items-center justify-between px-5 py-3 cursor-pointer list-none">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">POS Registers</span>
                <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5 text-zinc-500"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </summary>
              <div className="px-5 pb-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      {['Register','Status','Cashier','Trans.'].map(h => (
                        <th key={h} className="text-left py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {REGISTERS.map((r) => (
                      <tr key={r.id} className="border-t" style={{ borderColor: 'rgba(63,63,70,0.3)' }}>
                        <td className="py-2 text-zinc-300 font-medium">{r.name}</td>
                        <td className="py-2">
                          <span className={`text-[10px] rounded px-2 py-0.5 font-medium ${regStatusColor(r.status)}`}>{r.status}</span>
                        </td>
                        <td className="py-2 text-zinc-400">{r.cashier}</td>
                        <td className="py-2 font-mono text-zinc-300">{r.transactions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>

            {/* FastTab: Staff */}
            <details className="border-b" style={{ borderColor: 'rgba(63,63,70,0.4)' }}>
              <summary className="flex items-center justify-between px-5 py-3 cursor-pointer list-none">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Staff — Current Shift</span>
                <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5 text-zinc-500"><path d="M3 7.5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </summary>
              <div className="px-5 pb-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      {['Name','Role','Clock In'].map(h => (
                        <th key={h} className="text-left py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {STAFF.map((e) => (
                      <tr key={e.id} className="border-t" style={{ borderColor: 'rgba(63,63,70,0.3)' }}>
                        <td className="py-1.5 text-zinc-200">{e.name}</td>
                        <td className="py-1.5 text-zinc-400">{e.role}</td>
                        <td className="py-1.5 font-mono text-zinc-400">{e.clockIn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>

            {/* FastTab: Today's Performance */}
            <details className="border-b" style={{ borderColor: 'rgba(63,63,70,0.4)' }}>
              <summary className="flex items-center justify-between px-5 py-3 cursor-pointer list-none">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Today&apos;s Performance</span>
                <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5 text-zinc-500"><path d="M3 7.5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </summary>
              <div className="px-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-400">Hourly Sales — {detailStore.name}</span>
                  <span className="text-xs font-mono text-emerald-400">{fmtFull(detailStore.todaySales)} today</span>
                </div>
                <svg viewBox="0 0 480 120" className="w-full" style={{ height: 120 }}>
                  {HOURLY_SALES.map((val, i) => {
                    const barH = Math.round((val / MAX_HOURLY) * 90)
                    const x = i * 48 + 4
                    const y = 100 - barH
                    return (
                      <g key={i}>
                        <rect x={x} y={y} width={40} height={barH} rx="3" fill={i === 7 ? '#6366f1' : 'rgba(99,102,241,0.35)'} />
                        <text x={x + 20} y={116} textAnchor="middle" fontSize="9" fill="#71717a">{HOURS[i]}</text>
                        {i === 7 && (
                          <text x={x + 20} y={y - 3} textAnchor="middle" fontSize="9" fill="#818cf8">${(val/1000).toFixed(1)}k</text>
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>
            </details>

            {/* FastTab: Inventory */}
            <details className="border-b" style={{ borderColor: 'rgba(63,63,70,0.4)' }}>
              <summary className="flex items-center justify-between px-5 py-3 cursor-pointer list-none">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Inventory — Low Stock</span>
                <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5 text-zinc-500"><path d="M3 7.5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </summary>
              <div className="px-5 pb-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      {['SKU','Product','Qty','Reorder At'].map(h => (
                        <th key={h} className="text-left py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LOW_STOCK.map((item) => (
                      <tr key={item.sku} className="border-t" style={{ borderColor: 'rgba(63,63,70,0.3)' }}>
                        <td className="py-1.5 font-mono text-zinc-500 text-[11px]">{item.sku}</td>
                        <td className="py-1.5 text-zinc-300 max-w-[150px] truncate">{item.name}</td>
                        <td className="py-1.5">
                          <span className={`font-mono font-semibold ${item.qty === 0 ? 'text-red-400' : 'text-amber-400'}`}>{item.qty}</span>
                        </td>
                        <td className="py-1.5 font-mono text-zinc-500">{item.reorderPoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>

            {/* FastTab: Alerts */}
            <details>
              <summary className="flex items-center justify-between px-5 py-3 cursor-pointer list-none">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Alerts</span>
                  <span className="text-[10px] rounded-full px-1.5 py-0.5 bg-red-500/15 text-red-400 border border-red-500/20 font-medium">
                    {STORE_ALERTS.length}
                  </span>
                </div>
                <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5 text-zinc-500"><path d="M3 7.5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </summary>
              <div className="px-5 pb-4 space-y-2">
                {STORE_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg px-3 py-2.5 border text-xs ${alertTypeColor(alert.type)}`}
                  >
                    <div className="font-medium mb-0.5">{alert.message}</div>
                    <div className="text-[10px] opacity-60">{alert.time}</div>
                  </div>
                ))}
                {STORE_ALERTS.length === 0 && (
                  <div className="text-xs text-zinc-500 py-2">No open alerts</div>
                )}
              </div>
            </details>

          </div>

          {/* Panel Footer */}
          <div className="px-5 py-3 border-t flex items-center gap-2" style={{ borderColor: 'rgba(63,63,70,0.5)' }}>
            <button className="flex-1 py-2 rounded-lg text-xs font-medium border" style={{ borderColor: 'rgba(99,102,241,0.35)', color: '#a5b4fc' }}>
              Edit Store
            </button>
            <button className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ background: 'rgba(99,102,241,0.85)', color: '#fff' }}>
              Open POS
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── KPI Icon ──────────────────────────────────────────────────────────────────
function StoreKpiIcon({ type, color }: { type: string; color: string }) {
  const bg = color.includes('indigo')  ? 'rgba(99,102,241,0.15)'
    : color.includes('emerald') ? 'rgba(52,211,153,0.15)'
    : color.includes('cyan')    ? 'rgba(34,211,238,0.15)'
    : color.includes('amber')   ? 'rgba(245,158,11,0.15)'
    : 'rgba(167,139,250,0.15)'

  const icons: Record<string, JSX.Element> = {
    stores:  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M2 7l6-5 6 5v7H2V7z" stroke="currentColor" strokeWidth="1.4"/><path d="M6 16v-5h4v5" stroke="currentColor" strokeWidth="1.4"/></svg>,
    active:  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    open:    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    revenue: <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M2 12l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    avg:     <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><rect x="2" y="5" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.4"/></svg>,
  }

  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
      <span className={color}>{icons[type]}</span>
    </div>
  )
}
