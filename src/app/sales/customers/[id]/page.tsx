import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'

interface Invoice {
  id: string; date: string; dueDate: string; amount: number; remaining: number; status: string
}
interface Payment {
  id: string; date: string; method: string; amount: number; appliedTo: string; status: string
}
interface ShipAddress {
  id: string; name: string; address: string; city: string; state: string; zip: string; isDefault: boolean
}
interface Contact {
  id: string; name: string; title: string; phone: string; email: string; primary: boolean
}

const INVOICES: Invoice[] = [
  { id: 'INV-10042', date: 'Apr 15, 2026', dueDate: 'May 15, 2026', amount: 4200.00, remaining: 4200.00, status: 'Open' },
  { id: 'INV-10031', date: 'Apr 1, 2026', dueDate: 'May 1, 2026', amount: 2890.50, remaining: 1200.00, status: 'Partial' },
  { id: 'INV-10018', date: 'Mar 15, 2026', dueDate: 'Apr 14, 2026', amount: 3100.00, remaining: 0, status: 'Paid' },
  { id: 'INV-10005', date: 'Mar 1, 2026', dueDate: 'Mar 31, 2026', amount: 5500.00, remaining: 0, status: 'Paid' },
  { id: 'INV-09991', date: 'Feb 14, 2026', dueDate: 'Mar 16, 2026', amount: 1800.00, remaining: 0, status: 'Paid' },
  { id: 'INV-09978', date: 'Feb 1, 2026', dueDate: 'Mar 3, 2026', amount: 2200.00, remaining: 0, status: 'Paid' },
  { id: 'INV-09962', date: 'Jan 18, 2026', dueDate: 'Feb 17, 2026', amount: 4100.00, remaining: 0, status: 'Paid' },
  { id: 'INV-09950', date: 'Jan 5, 2026', dueDate: 'Feb 4, 2026', amount: 3300.00, remaining: 0, status: 'Paid' },
  { id: 'INV-09935', date: 'Dec 20, 2025', dueDate: 'Jan 19, 2026', amount: 1650.00, remaining: 1650.00, status: 'Overdue' },
  { id: 'INV-09920', date: 'Dec 5, 2025', dueDate: 'Jan 4, 2026', amount: 2800.00, remaining: 0, status: 'Paid' },
]

const PAYMENTS: Payment[] = [
  { id: 'PMT-8821', date: 'Apr 10, 2026', method: 'ACH Transfer', amount: 5500.00, appliedTo: 'INV-10005', status: 'Posted' },
  { id: 'PMT-8790', date: 'Apr 2, 2026', method: 'ACH Transfer', amount: 1690.50, appliedTo: 'INV-10031', status: 'Posted' },
  { id: 'PMT-8755', date: 'Mar 20, 2026', method: 'ACH Transfer', amount: 3100.00, appliedTo: 'INV-10018', status: 'Posted' },
  { id: 'PMT-8722', date: 'Mar 10, 2026', method: 'Wire', amount: 1800.00, appliedTo: 'INV-09991', status: 'Posted' },
  { id: 'PMT-8688', date: 'Mar 1, 2026', method: 'ACH Transfer', amount: 2200.00, appliedTo: 'INV-09978', status: 'Posted' },
  { id: 'PMT-8654', date: 'Feb 15, 2026', method: 'Check', amount: 4100.00, appliedTo: 'INV-09962', status: 'Cleared' },
  { id: 'PMT-8621', date: 'Feb 3, 2026', method: 'ACH Transfer', amount: 3300.00, appliedTo: 'INV-09950', status: 'Posted' },
  { id: 'PMT-8590', date: 'Jan 10, 2026', method: 'Wire', amount: 2800.00, appliedTo: 'INV-09920', status: 'Posted' },
]

const SHIP_ADDRESSES: ShipAddress[] = [
  { id: 'SA01', name: 'Detroit HQ', address: '192 Fisher Road, Suite 400', city: 'Detroit', state: 'MI', zip: '48201', isDefault: true },
  { id: 'SA02', name: 'Chicago Office', address: '400 N Michigan Ave', city: 'Chicago', state: 'IL', zip: '60611', isDefault: false },
  { id: 'SA03', name: 'Remote Warehouse', address: '2200 Industrial Dr', city: 'Toledo', state: 'OH', zip: '43601', isDefault: false },
]

const CONTACTS: Contact[] = [
  { id: 'CT01', name: 'John Smith', title: 'VP Finance', phone: '+1 555 0100', email: 'john@cannon.com', primary: true },
  { id: 'CT02', name: 'Karen Mills', title: 'AP Manager', phone: '+1 555 0101', email: 'karen@cannon.com', primary: false },
  { id: 'CT03', name: 'Tom Nguyen', title: 'IT Director', phone: '+1 555 0102', email: 'tom@cannon.com', primary: false },
]

const MONTHLY_SALES = {
  current: [2800, 3400, 2900, 4100, 3800, 4400, 3600, 4200, 3900, 5100, 4800, 0],
  prior:   [2200, 2900, 3100, 3400, 3200, 3800, 3300, 3900, 3600, 4200, 4400, 4900],
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const INV_STATUS: Record<string, string> = {
  Open: 'bg-indigo-500/20 text-indigo-400',
  Partial: 'bg-amber-500/20 text-amber-400',
  Paid: 'bg-emerald-500/20 text-emerald-400',
  Overdue: 'bg-red-500/20 text-red-400',
}

const PMT_STATUS: Record<string, string> = {
  Posted: 'bg-emerald-500/20 text-emerald-400',
  Cleared: 'bg-blue-500/20 text-blue-400',
  Pending: 'bg-amber-500/20 text-amber-400',
}

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function SalesBarChart() {
  const allVals = [...MONTHLY_SALES.current, ...MONTHLY_SALES.prior].filter(v => v > 0)
  const maxVal = Math.max(...allVals)
  const W = 520
  const H = 120
  const barW = 16
  const gap = 4
  const groupW = barW * 2 + gap + 8
  const padL = 8
  const padB = 24

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + padB}`} style={{ overflow: 'visible' }}>
      {MONTHS.map((month, i) => {
        const x = padL + i * groupW
        const curH = MONTHLY_SALES.current[i] ? (MONTHLY_SALES.current[i] / maxVal) * H : 0
        const priorH = (MONTHLY_SALES.prior[i] / maxVal) * H
        return (
          <g key={month}>
            {/* prior year bar */}
            <rect
              x={x} y={H - priorH} width={barW} height={priorH}
              rx={2} fill="rgba(99,102,241,0.25)"
            />
            {/* current year bar */}
            <rect
              x={x + barW + gap} y={H - curH} width={barW} height={curH}
              rx={2} fill="rgba(99,102,241,0.7)"
            />
            <text x={x + barW + gap / 2} y={H + 16} textAnchor="middle" fontSize={8} fill="#475569">{month}</text>
          </g>
        )
      })}
      {/* legend */}
      <rect x={W - 130} y={4} width={10} height={10} rx={1} fill="rgba(99,102,241,0.25)" />
      <text x={W - 116} y={13} fontSize={9} fill="#94a3b8">Prior Year</text>
      <rect x={W - 65} y={4} width={10} height={10} rx={1} fill="rgba(99,102,241,0.7)" />
      <text x={W - 51} y={13} fontSize={9} fill="#94a3b8">Current</text>
    </svg>
  )
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customerName = id === 'C10000' ? 'The Cannon Group PLC' : `Customer ${id}`

  const actions = (
    <>
      <button style={{ background: 'rgba(99,102,241,0.85)', color: '#fff' }}
        className="px-3 py-1.5 rounded text-xs font-medium hover:opacity-90 transition">
        Edit
      </button>
      {['Statement', 'Transactions', 'Contact', 'Delete'].map(lbl => (
        <button key={lbl}
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
          className="px-3 py-1.5 rounded text-xs font-medium hover:opacity-80 transition">
          {lbl}
        </button>
      ))}
    </>
  )

  return (
    <div className="min-h-[100dvh]" style={{ background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title={customerName}
        breadcrumb={[
          { label: 'Sales', href: '/sales' },
          { label: 'Customers', href: '/sales/customers' },
        ]}
        actions={actions}
      />

      <div className="px-6 pt-4 pb-8 flex gap-5">
        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Header FactBox */}
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}
            className="rounded-lg p-4 mb-4 grid grid-cols-3 gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#475569' }}>Customer No.</div>
              <div className="text-sm font-bold text-indigo-400 mb-1">{id === 'C10000' ? 'C10000' : id}</div>
              <div className="text-base font-semibold text-zinc-100 mb-2">{customerName}</div>
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                Large Corp
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: '#94a3b8' }}>Credit Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">OK</span>
              </div>
              <div>
                <span className="text-xs" style={{ color: '#94a3b8' }}>Balance: </span>
                <span className="text-sm font-semibold text-zinc-100">$8,432.10</span>
              </div>
              <div>
                <span className="text-xs" style={{ color: '#94a3b8' }}>Credit Limit: </span>
                <span className="text-sm font-semibold text-zinc-100">$50,000.00</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                ['Contact', 'John Smith'],
                ['Phone', '+1 555 0100'],
                ['Email', 'john@cannon.com'],
                ['Sales Rep', 'Alice Chen'],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-xs w-20 flex-shrink-0" style={{ color: '#94a3b8' }}>{label}:</span>
                  <span className="text-xs text-zinc-200">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tab strip (client-side toggle handled via details/summary here as server component) */}
          <CustomerTabs
            invoices={INVOICES}
            payments={PAYMENTS}
            shipAddresses={SHIP_ADDRESSES}
            contacts={CONTACTS}
          />
        </div>

        {/* FactBox Sidebar */}
        <div className="w-[280px] flex-shrink-0 flex flex-col gap-3">
          {/* Customer Statistics */}
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }} className="rounded-lg p-4">
            <div className="text-xs font-semibold mb-3 text-zinc-300 uppercase tracking-wide">Customer Statistics</div>
            {[
              ['YTD Sales', '$42,380.00', '#6ee7b7'],
              ['Overdue', '$1,650.00', '#fca5a5'],
              ['Credit Used', '16.9%', '#a5b4fc'],
            ].map(([label, val, color]) => (
              <div key={label} className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                <span className="text-xs" style={{ color: '#94a3b8' }}>{label}</span>
                <span className="text-xs font-semibold" style={{ color }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Linked Documents */}
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }} className="rounded-lg p-4">
            <div className="text-xs font-semibold mb-3 text-zinc-300 uppercase tracking-wide">Linked Documents</div>
            <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: '#475569' }}>Recent Invoices</div>
            {INVOICES.slice(0, 3).map(inv => (
              <Link key={inv.id} href={`/sales/invoices/${inv.id}`}
                className="flex justify-between items-center py-1 text-xs hover:text-indigo-300 transition"
                style={{ color: '#a5b4fc', borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                <span>{inv.id}</span>
                <span style={{ color: '#94a3b8' }}>{inv.date}</span>
              </Link>
            ))}
            <div className="text-[10px] uppercase tracking-widest mt-3 mb-1.5" style={{ color: '#475569' }}>Recent Orders</div>
            {['ORD-5520', 'ORD-5491', 'ORD-5460'].map(ord => (
              <Link key={ord} href={`/sales/orders/${ord}`}
                className="flex justify-between items-center py-1 text-xs hover:text-indigo-300 transition"
                style={{ color: '#a5b4fc', borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                <span>{ord}</span>
              </Link>
            ))}
          </div>

          {/* Notes */}
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }} className="rounded-lg p-4">
            <div className="text-xs font-semibold mb-3 text-zinc-300 uppercase tracking-wide">Notes</div>
            <textarea
              defaultValue="Long-standing enterprise account. Net 30 terms. ACH preferred. Q3 renewal discussions expected June 2026."
              rows={4}
              className="w-full text-xs rounded p-2 resize-none outline-none"
              style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', color: '#94a3b8' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Client tabs component embedded (this is server component file; inline client boundary via separate component)
function CustomerTabs({
  invoices, payments, shipAddresses, contacts
}: {
  invoices: Invoice[], payments: Payment[], shipAddresses: ShipAddress[], contacts: Contact[]
}) {
  const cardStyle = { background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }
  const thStyle = { color: '#94a3b8', background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)' }
  const trStyle = { borderBottom: '1px solid rgba(99,102,241,0.08)' }

  function fmt(n: number) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const INV_STATUS: Record<string, string> = {
    Open: 'bg-indigo-500/20 text-indigo-400',
    Partial: 'bg-amber-500/20 text-amber-400',
    Paid: 'bg-emerald-500/20 text-emerald-400',
    Overdue: 'bg-red-500/20 text-red-400',
  }

  const PMT_STATUS: Record<string, string> = {
    Posted: 'bg-emerald-500/20 text-emerald-400',
    Cleared: 'bg-blue-500/20 text-blue-400',
    Pending: 'bg-amber-500/20 text-amber-400',
  }

  const ALLMONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const MONTHLY_SALES = {
    current: [2800, 3400, 2900, 4100, 3800, 4400, 3600, 4200, 3900, 5100, 4800, 0],
    prior: [2200, 2900, 3100, 3400, 3200, 3800, 3300, 3900, 3600, 4200, 4400, 4900],
  }

  function SalesChart() {
    const allVals = [...MONTHLY_SALES.current, ...MONTHLY_SALES.prior].filter(v => v > 0)
    const maxVal = Math.max(...allVals)
    const W = 520; const H = 110
    const barW = 15; const gap = 3; const groupW = barW * 2 + gap + 10; const padB = 22
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H + padB}`}>
        {ALLMONTHS.map((m, i) => {
          const x = 4 + i * groupW
          const ch = MONTHLY_SALES.current[i] ? (MONTHLY_SALES.current[i] / maxVal) * H : 0
          const ph = (MONTHLY_SALES.prior[i] / maxVal) * H
          return (
            <g key={m}>
              <rect x={x} y={H - ph} width={barW} height={ph} rx={2} fill="rgba(99,102,241,0.25)" />
              <rect x={x + barW + gap} y={H - ch} width={barW} height={ch} rx={2} fill="rgba(99,102,241,0.75)" />
              <text x={x + barW + gap / 2} y={H + 15} textAnchor="middle" fontSize={8} fill="#475569">{m}</text>
            </g>
          )
        })}
        <rect x={W - 120} y={4} width={10} height={10} rx={1} fill="rgba(99,102,241,0.25)" />
        <text x={W - 106} y={13} fontSize={9} fill="#94a3b8">Prior Year</text>
        <rect x={W - 58} y={4} width={10} height={10} rx={1} fill="rgba(99,102,241,0.75)" />
        <text x={W - 44} y={13} fontSize={9} fill="#94a3b8">Current</text>
      </svg>
    )
  }

  return (
    <div>
      {/* General Tab */}
      <details open style={cardStyle} className="rounded-lg mb-3 overflow-hidden">
        <summary className="px-4 py-3 cursor-pointer text-xs font-semibold text-zinc-300 uppercase tracking-wide select-none"
          style={{ borderBottom: '1px solid rgba(99,102,241,0.12)', listStyle: 'none' }}>
          General
        </summary>
        <div className="p-4 grid grid-cols-2 gap-4">
          {/* Address & Contact FastTab */}
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: '#475569' }}>Address &amp; Contact</div>
            {[
              ['Address Line 1', '192 Fisher Road'],
              ['Address Line 2', 'Suite 400'],
              ['City', 'Detroit'],
              ['State', 'MI'],
              ['ZIP', '48201'],
              ['Country', 'US'],
              ['Phone', '+1 555 0100'],
              ['Email', 'john@cannon.com'],
              ['Website', 'www.cannongroup.com'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2 py-1" style={{ borderBottom: '1px solid rgba(99,102,241,0.05)' }}>
                <span className="text-xs w-32 flex-shrink-0" style={{ color: '#94a3b8' }}>{k}</span>
                <span className="text-xs text-zinc-200">{v}</span>
              </div>
            ))}
          </div>
          {/* Customer Group & Credit side by side */}
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: '#475569' }}>Customer Group &amp; Pricing</div>
            {[
              ['Customer Group', 'Large Corp'],
              ['Price List', 'Corporate Q2 2026'],
              ['Payment Terms', 'Net 30'],
              ['Payment Method', 'ACH Transfer'],
              ['Currency', 'USD'],
              ['Language', 'English'],
              ['Tax Exemption', 'No'],
              ['Certificate', '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2 py-1" style={{ borderBottom: '1px solid rgba(99,102,241,0.05)' }}>
                <span className="text-xs w-32 flex-shrink-0" style={{ color: '#94a3b8' }}>{k}</span>
                <span className="text-xs text-zinc-200">{v}</span>
              </div>
            ))}
            <div className="text-[10px] uppercase tracking-widest mt-4 mb-2 font-semibold" style={{ color: '#475569' }}>Credit &amp; Limits</div>
            {[
              ['Credit Limit', '$50,000.00'],
              ['Current Balance', '$8,432.10'],
              ['Overdue Balance', '$0.00'],
              ['Credit Status', null],
              ['Blocked', 'No'],
              ['Bank Account (EFT)', '****4521'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2 py-1 items-center" style={{ borderBottom: '1px solid rgba(99,102,241,0.05)' }}>
                <span className="text-xs w-32 flex-shrink-0" style={{ color: '#94a3b8' }}>{k}</span>
                {k === 'Credit Status'
                  ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">OK</span>
                  : <span className="text-xs text-zinc-200">{v}</span>
                }
              </div>
            ))}
          </div>
        </div>
      </details>

      {/* Invoicing Tab */}
      <details style={cardStyle} className="rounded-lg mb-3 overflow-hidden">
        <summary className="px-4 py-3 cursor-pointer text-xs font-semibold text-zinc-300 uppercase tracking-wide select-none"
          style={{ borderBottom: '1px solid rgba(99,102,241,0.12)', listStyle: 'none' }}>
          Invoicing
        </summary>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={thStyle}>
                {['Invoice #', 'Date', 'Due Date', 'Amount', 'Remaining', 'Status'].map(h => (
                  <th key={h} className="py-2.5 px-3 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={trStyle} className="hover:bg-indigo-500/5">
                  <td className="py-2.5 px-3 text-indigo-400">{inv.id}</td>
                  <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>{inv.date}</td>
                  <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>{inv.dueDate}</td>
                  <td className="py-2.5 px-3 text-zinc-200">{fmt(inv.amount)}</td>
                  <td className="py-2.5 px-3" style={{ color: inv.remaining > 0 ? '#fca5a5' : '#6ee7b7' }}>{fmt(inv.remaining)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${INV_STATUS[inv.status]}`}>{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* Payments Tab */}
      <details style={cardStyle} className="rounded-lg mb-3 overflow-hidden">
        <summary className="px-4 py-3 cursor-pointer text-xs font-semibold text-zinc-300 uppercase tracking-wide select-none"
          style={{ borderBottom: '1px solid rgba(99,102,241,0.12)', listStyle: 'none' }}>
          Payments
        </summary>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={thStyle}>
                {['Payment #', 'Date', 'Method', 'Amount', 'Applied To', 'Status'].map(h => (
                  <th key={h} className="py-2.5 px-3 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(pmt => (
                <tr key={pmt.id} style={trStyle} className="hover:bg-indigo-500/5">
                  <td className="py-2.5 px-3 text-indigo-400">{pmt.id}</td>
                  <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>{pmt.date}</td>
                  <td className="py-2.5 px-3 text-zinc-200">{pmt.method}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-medium">{fmt(pmt.amount)}</td>
                  <td className="py-2.5 px-3 text-indigo-400">{pmt.appliedTo}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${PMT_STATUS[pmt.status]}`}>{pmt.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* Shipping Tab */}
      <details style={cardStyle} className="rounded-lg mb-3 overflow-hidden">
        <summary className="px-4 py-3 cursor-pointer text-xs font-semibold text-zinc-300 uppercase tracking-wide select-none"
          style={{ borderBottom: '1px solid rgba(99,102,241,0.12)', listStyle: 'none' }}>
          Shipping
        </summary>
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: '#475569' }}>Ship-To Addresses</div>
          <table className="w-full text-xs border-collapse mb-4">
            <thead>
              <tr style={thStyle}>
                {['Name', 'Address', 'City', 'State', 'ZIP', 'Default'].map(h => (
                  <th key={h} className="py-2 px-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shipAddresses.map(sa => (
                <tr key={sa.id} style={trStyle} className="hover:bg-indigo-500/5">
                  <td className="py-2 px-3 text-zinc-200">{sa.name}</td>
                  <td className="py-2 px-3" style={{ color: '#94a3b8' }}>{sa.address}</td>
                  <td className="py-2 px-3" style={{ color: '#94a3b8' }}>{sa.city}</td>
                  <td className="py-2 px-3" style={{ color: '#94a3b8' }}>{sa.state}</td>
                  <td className="py-2 px-3" style={{ color: '#94a3b8' }}>{sa.zip}</td>
                  <td className="py-2 px-3">
                    {sa.isDefault && <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400">Default</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-8">
            <div>
              <span className="text-xs" style={{ color: '#94a3b8' }}>Shipping Method: </span>
              <span className="text-xs text-zinc-200">UPS Ground</span>
            </div>
            <div>
              <span className="text-xs" style={{ color: '#94a3b8' }}>UPS Account: </span>
              <span className="text-xs text-zinc-200">1Z9999W99999999999</span>
            </div>
          </div>
        </div>
      </details>

      {/* Statistics Tab */}
      <details style={cardStyle} className="rounded-lg mb-3 overflow-hidden">
        <summary className="px-4 py-3 cursor-pointer text-xs font-semibold text-zinc-300 uppercase tracking-wide select-none"
          style={{ borderBottom: '1px solid rgba(99,102,241,0.12)', listStyle: 'none' }}>
          Statistics
        </summary>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              ['YTD Sales', '$42,380.00'],
              ['Last Year Sales', '$38,920.00'],
              ['3-Year Average', '$36,180.00'],
              ['Last Order Date', 'Apr 15, 2026'],
              ['Last Payment Date', 'Apr 10, 2026'],
            ].map(([k, v]) => (
              <div key={k} style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
                className="rounded-lg px-3 py-2.5">
                <div className="text-[10px] mb-1" style={{ color: '#94a3b8' }}>{k}</div>
                <div className="text-sm font-semibold text-zinc-100">{v}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Monthly Sales — Current vs Prior Year</div>
          <SalesChart />
        </div>
      </details>

      {/* Contact Info Tab */}
      <details style={cardStyle} className="rounded-lg mb-3 overflow-hidden">
        <summary className="px-4 py-3 cursor-pointer text-xs font-semibold text-zinc-300 uppercase tracking-wide select-none"
          style={{ borderBottom: '1px solid rgba(99,102,241,0.12)', listStyle: 'none' }}>
          Contact Info
        </summary>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={thStyle}>
                {['Name', 'Title', 'Phone', 'Email', 'Primary'].map(h => (
                  <th key={h} className="py-2.5 px-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map(ct => (
                <tr key={ct.id} style={trStyle} className="hover:bg-indigo-500/5">
                  <td className="py-2.5 px-3 text-zinc-200 font-medium">{ct.name}</td>
                  <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>{ct.title}</td>
                  <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>{ct.phone}</td>
                  <td className="py-2.5 px-3 text-indigo-400">{ct.email}</td>
                  <td className="py-2.5 px-3">
                    {ct.primary && <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400">Primary</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
