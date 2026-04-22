'use client'

import { useState, useEffect } from 'react'
import TopBar from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

type QuoteLine = {
  item: string
  qty: number
  unitPrice: number
  discount: number
  net: number
}

type Quote = {
  id: string
  quoteNo: string
  date: string
  validUntil: string
  customer: string
  contact: string
  amount: number
  probability: number
  status: 'Draft' | 'Sent' | 'Won' | 'Lost' | 'Expired'
  rep: string
  lines: QuoteLine[]
  notes: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const QUOTES: Quote[] = [
  { id: '1', quoteNo: 'QT-2026-0892', date: 'Apr 1', validUntil: 'May 1', customer: 'Fabrikam Inc', contact: 'John Smith', amount: 45200, probability: 80, status: 'Sent', rep: 'Alice Chen', notes: 'Awaiting sign-off from procurement.', lines: [{ item: 'NovaPOS License x10', qty: 10, unitPrice: 3800, discount: 5, net: 36100 }, { item: 'Implementation Services', qty: 1, unitPrice: 9100, discount: 0, net: 9100 }] },
  { id: '2', quoteNo: 'QT-2026-0893', date: 'Apr 2', validUntil: 'May 2', customer: 'Adatum Corp', contact: 'Jane Doe', amount: 128500, probability: 60, status: 'Draft', rep: 'Bob Wilson', notes: 'Draft pending internal review.', lines: [{ item: 'Enterprise Suite', qty: 1, unitPrice: 98000, discount: 10, net: 88200 }, { item: 'Training Package', qty: 5, unitPrice: 8060, discount: 0, net: 40300 }] },
  { id: '3', quoteNo: 'QT-2026-0894', date: 'Apr 3', validUntil: 'Apr 25', customer: 'Contoso Ltd', contact: 'Mike Brown', amount: 8900, probability: 90, status: 'Won', rep: 'Alice Chen', notes: 'PO received. Convert to order.', lines: [{ item: 'Add-on Module', qty: 2, unitPrice: 4450, discount: 0, net: 8900 }] },
  { id: '4', quoteNo: 'QT-2026-0895', date: 'Apr 4', validUntil: 'Apr 20', customer: 'Litware Inc', contact: 'Sarah Jones', amount: 22100, probability: 20, status: 'Expired', rep: 'Carlos Mendez', notes: 'No response from customer.', lines: [{ item: 'NovaPOS Starter', qty: 5, unitPrice: 4420, discount: 0, net: 22100 }] },
  { id: '5', quoteNo: 'QT-2026-0896', date: 'Apr 5', validUntil: 'May 5', customer: 'Northwind Traders', contact: 'David Lee', amount: 67400, probability: 75, status: 'Sent', rep: 'Bob Wilson', notes: 'Follow up scheduled for Apr 28.', lines: [{ item: 'Warehouse Module', qty: 3, unitPrice: 18500, discount: 8, net: 51060 }, { item: 'Support Contract', qty: 1, unitPrice: 16340, discount: 0, net: 16340 }] },
  { id: '6', quoteNo: 'QT-2026-0897', date: 'Apr 6', validUntil: 'May 6', customer: 'Alpine Ski House', contact: 'Emma White', amount: 14200, probability: 50, status: 'Draft', rep: 'Carlos Mendez', notes: 'Awaiting budget approval.', lines: [{ item: 'Retail POS Bundle', qty: 2, unitPrice: 7100, discount: 0, net: 14200 }] },
  { id: '7', quoteNo: 'QT-2026-0898', date: 'Apr 7', validUntil: 'May 7', customer: 'Wide World Importers', contact: 'Omar Khalid', amount: 215000, probability: 65, status: 'Sent', rep: 'Alice Chen', notes: 'Large deal — exec sponsor needed.', lines: [{ item: 'Enterprise Platform', qty: 1, unitPrice: 180000, discount: 5, net: 171000 }, { item: 'Custom Integration', qty: 1, unitPrice: 44000, discount: 0, net: 44000 }] },
  { id: '8', quoteNo: 'QT-2026-0899', date: 'Apr 8', validUntil: 'May 8', customer: 'Trey Research', contact: 'Lisa Grant', amount: 31600, probability: 45, status: 'Draft', rep: 'Sarah Lopez', notes: 'Technical evaluation in progress.', lines: [{ item: 'Analytics Module', qty: 4, unitPrice: 7900, discount: 0, net: 31600 }] },
  { id: '9', quoteNo: 'QT-2026-0900', date: 'Apr 9', validUntil: 'May 9', customer: 'Tailspin Toys', contact: 'Paul Nguyen', amount: 5800, probability: 85, status: 'Won', rep: 'Bob Wilson', notes: 'Signed. Schedule onboarding.', lines: [{ item: 'SMB License', qty: 2, unitPrice: 2900, discount: 0, net: 5800 }] },
  { id: '10', quoteNo: 'QT-2026-0901', date: 'Apr 10', validUntil: 'Apr 30', customer: 'The Phone Company', contact: 'Nina Patel', amount: 42000, probability: 30, status: 'Lost', rep: 'Carlos Mendez', notes: 'Went with competitor.', lines: [{ item: 'Telecom Suite', qty: 3, unitPrice: 14000, discount: 0, net: 42000 }] },
  { id: '11', quoteNo: 'QT-2026-0902', date: 'Apr 11', validUntil: 'May 11', customer: 'Coho Winery', contact: 'Marco Rossi', amount: 18750, probability: 70, status: 'Sent', rep: 'Sarah Lopez', notes: 'Interested in multi-site rollout.', lines: [{ item: 'POS Terminal x5', qty: 5, unitPrice: 3750, discount: 0, net: 18750 }] },
  { id: '12', quoteNo: 'QT-2026-0903', date: 'Apr 12', validUntil: 'May 12', customer: 'Relecloud', contact: 'Amy Zhang', amount: 93200, probability: 55, status: 'Draft', rep: 'Alice Chen', notes: 'Needs cloud hosting add-on pricing.', lines: [{ item: 'Cloud ERP', qty: 1, unitPrice: 93200, discount: 0, net: 93200 }] },
  { id: '13', quoteNo: 'QT-2026-0904', date: 'Apr 13', validUntil: 'May 13', customer: 'Fourth Coffee', contact: 'Steve Kim', amount: 7600, probability: 90, status: 'Won', rep: 'Bob Wilson', notes: 'Fast close. Upsell opportunity.', lines: [{ item: 'Coffee Chain Bundle', qty: 4, unitPrice: 1900, discount: 0, net: 7600 }] },
  { id: '14', quoteNo: 'QT-2026-0905', date: 'Apr 14', validUntil: 'May 14', customer: 'Humongous Insurance', contact: 'Cathy Burns', amount: 340000, probability: 40, status: 'Sent', rep: 'Carlos Mendez', notes: 'Legal review underway.', lines: [{ item: 'Insurance Platform', qty: 1, unitPrice: 340000, discount: 0, net: 340000 }] },
  { id: '15', quoteNo: 'QT-2026-0906', date: 'Apr 15', validUntil: 'Apr 25', customer: 'Woodgrove Bank', contact: 'James Ford', amount: 28400, probability: 15, status: 'Expired', rep: 'Sarah Lopez', notes: 'Budget frozen for Q2.', lines: [{ item: 'Banking Module', qty: 2, unitPrice: 14200, discount: 0, net: 28400 }] },
  { id: '16', quoteNo: 'QT-2026-0907', date: 'Apr 16', validUntil: 'May 16', customer: 'Bellows College', contact: 'Helen Moore', amount: 11200, probability: 60, status: 'Draft', rep: 'Alice Chen', notes: 'Education pricing requested.', lines: [{ item: 'EDU License x8', qty: 8, unitPrice: 1400, discount: 0, net: 11200 }] },
  { id: '17', quoteNo: 'QT-2026-0908', date: 'Apr 17', validUntil: 'May 17', customer: 'Proseware Inc', contact: 'Tony Walsh', amount: 54600, probability: 72, status: 'Sent', rep: 'Bob Wilson', notes: 'Demo scheduled for Apr 25.', lines: [{ item: 'Pro Suite', qty: 6, unitPrice: 9100, discount: 0, net: 54600 }] },
  { id: '18', quoteNo: 'QT-2026-0909', date: 'Apr 18', validUntil: 'May 18', customer: 'Lucerne Publishing', contact: 'Rachel Green', amount: 19300, probability: 48, status: 'Draft', rep: 'Carlos Mendez', notes: 'Revisions requested on T&Cs.', lines: [{ item: 'Publishing Module', qty: 1, unitPrice: 19300, discount: 0, net: 19300 }] },
  { id: '19', quoteNo: 'QT-2026-0910', date: 'Apr 19', validUntil: 'May 19', customer: 'Adventure Works', contact: 'Brian Fox', amount: 76800, probability: 82, status: 'Sent', rep: 'Sarah Lopez', notes: 'Strong buying signal.', lines: [{ item: 'Distribution Suite', qty: 4, unitPrice: 19200, discount: 0, net: 76800 }] },
  { id: '20', quoteNo: 'QT-2026-0911', date: 'Apr 20', validUntil: 'May 20', customer: 'City Power & Light', contact: 'Diane West', amount: 132000, probability: 35, status: 'Lost', rep: 'Alice Chen', notes: 'Price sensitivity too high.', lines: [{ item: 'Utility Platform', qty: 1, unitPrice: 132000, discount: 0, net: 132000 }] },
]

const STATUS_CHIP: Record<string, string> = {
  Draft: 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30',
  Sent: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  Won: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Lost: 'bg-red-500/20 text-red-400 border border-red-500/30',
  Expired: 'bg-neutral-600/30 text-neutral-400 border border-neutral-600/40',
}

const STATUSES = ['All', 'Draft', 'Sent', 'Won', 'Lost', 'Expired']

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuotesPage() {
  const [_apiData, setApiData] = useState<unknown>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/sales/quotes')
      .then(r => r.json())
      .then(d => setApiData(d))
      .catch(() => {})
  }, [])

  const filtered = QUOTES.filter(q => {
    const matchStatus = statusFilter === 'All' || q.status === statusFilter
    const matchSearch = !search || q.customer.toLowerCase().includes(search.toLowerCase()) || q.quoteNo.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const toggleAll = () => {
    if (checked.size === filtered.length) setChecked(new Set())
    else setChecked(new Set(filtered.map(q => q.id)))
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Sales Quotations"
        breadcrumb={[
          { label: 'Sales', href: '/sales' },
          { label: 'Quotations', href: '/sales/quotes' },
        ]}
        actions={
          <>
            <button className="px-3 py-1.5 rounded text-xs font-medium text-white" style={{ background: 'rgba(99,102,241,0.75)' }}>
              New Quotation
            </button>
            <button className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}>
              Convert to Order
            </button>
            <button className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}>
              Send by Email
            </button>
          </>
        }
      />

      <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">

        {/* Filter Bar */}
        <div
          className="rounded-xl px-4 py-3 flex flex-wrap gap-3 items-center"
          style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <input
            className="h-8 rounded px-3 text-xs w-36 outline-none"
            style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            placeholder="Quote #"
          />
          <input
            className="h-8 rounded px-3 text-xs w-40 outline-none"
            style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            placeholder="Customer"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="h-8 rounded px-3 text-xs outline-none"
            style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <input
            className="h-8 rounded px-3 text-xs w-28 outline-none"
            style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            placeholder="Date from"
          />
          <input
            className="h-8 rounded px-3 text-xs w-28 outline-none"
            style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            placeholder="Date to"
          />
          <input
            className="h-8 rounded px-3 text-xs w-28 outline-none"
            style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            placeholder="Min amount"
          />
          <input
            className="h-8 rounded px-3 text-xs w-28 outline-none"
            style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            placeholder="Max amount"
          />
          <button
            className="h-8 px-4 rounded text-xs font-medium"
            style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}
          >
            Search
          </button>
        </div>

        {/* Table */}
        <div
          className="rounded-xl flex-1 overflow-auto"
          style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
            <thead className="sticky top-0" style={{ background: '#16213e', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
              <tr>
                <th className="px-4 py-3 text-left w-8">
                  <input
                    type="checkbox"
                    className="accent-indigo-500"
                    checked={checked.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                {['Quote #', 'Date', 'Valid Until', 'Customer', 'Contact', 'Amount', 'Probability', 'Status', 'Sales Rep'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium cursor-pointer select-none" style={{ color: '#94a3b8' }}>
                    <span className="flex items-center gap-1">
                      {h}
                      <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                        <path d="M4 0L7 4H1L4 0Z" fill="currentColor" opacity="0.4" />
                        <path d="M4 10L1 6H7L4 10Z" fill="currentColor" opacity="0.4" />
                      </svg>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, i) => (
                <tr
                  key={q.id}
                  className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none' }}
                  onClick={() => setSelectedQuote(q)}
                >
                  <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleCheck(q.id) }}>
                    <input type="checkbox" className="accent-indigo-500" checked={checked.has(q.id)} onChange={() => {}} />
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-300">{q.quoteNo}</td>
                  <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{q.date}</td>
                  <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{q.validUntil}</td>
                  <td className="px-4 py-3 text-zinc-200 font-medium">{q.customer}</td>
                  <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{q.contact}</td>
                  <td className="px-4 py-3 text-zinc-100 font-medium">{fmtCurrency(q.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.15)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${q.probability}%`,
                            background: q.probability >= 75 ? '#10b981' : q.probability >= 50 ? '#6366f1' : q.probability >= 25 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                      <span style={{ color: '#94a3b8' }}>{q.probability}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_CHIP[q.status]}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{q.rep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs" style={{ color: '#94a3b8' }}>
          <span>1–20 of 156</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, '...', 8].map((p, i) => (
              <button
                key={i}
                className="w-7 h-7 rounded flex items-center justify-center"
                style={p === 1
                  ? { background: 'rgba(99,102,241,0.3)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)' }
                  : { background: 'transparent', color: '#94a3b8', border: '1px solid rgba(99,102,241,0.15)' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Drawer */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelectedQuote(null)}>
          <div className="flex-1" />
          <div
            className="w-[480px] h-full overflow-y-auto flex flex-col"
            style={{ background: '#16213e', borderLeft: '1px solid rgba(99,102,241,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
              <div>
                <p className="text-xs font-mono text-indigo-300">{selectedQuote.quoteNo}</p>
                <p className="text-base font-semibold text-zinc-100 mt-0.5">{selectedQuote.customer}</p>
              </div>
              <button
                className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-200"
                style={{ background: 'rgba(255,255,255,0.05)' }}
                onClick={() => setSelectedQuote(null)}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>

            {/* Quote meta */}
            <div className="px-6 py-4 grid grid-cols-2 gap-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.10)' }}>
              {[
                ['Contact', selectedQuote.contact],
                ['Sales Rep', selectedQuote.rep],
                ['Date', selectedQuote.date],
                ['Valid Until', selectedQuote.validUntil],
                ['Probability', `${selectedQuote.probability}%`],
                ['Status', selectedQuote.status],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: '#94a3b8' }}>{label}</p>
                  <p className="text-xs text-zinc-200">{val}</p>
                </div>
              ))}
            </div>

            {/* Line items */}
            <div className="px-6 py-4 flex-1">
              <p className="text-xs font-semibold text-zinc-300 mb-3">Line Items</p>
              <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
                    {['Item', 'Qty', 'Unit Price', 'Disc%', 'Net'].map(h => (
                      <th key={h} className="pb-2 text-left font-medium" style={{ color: '#94a3b8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedQuote.lines.map((ln, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
                      <td className="py-2 pr-4 text-zinc-300">{ln.item}</td>
                      <td className="py-2 pr-4 text-zinc-400">{ln.qty}</td>
                      <td className="py-2 pr-4 text-zinc-400">{fmtCurrency(ln.unitPrice)}</td>
                      <td className="py-2 pr-4 text-zinc-400">{ln.discount}%</td>
                      <td className="py-2 font-medium text-zinc-100">{fmtCurrency(ln.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 pt-3 flex justify-end gap-4" style={{ borderTop: '1px solid rgba(99,102,241,0.12)' }}>
                <span className="text-xs" style={{ color: '#94a3b8' }}>Total</span>
                <span className="text-sm font-bold text-zinc-100">{fmtCurrency(selectedQuote.amount)}</span>
              </div>
            </div>

            {/* Notes */}
            {selectedQuote.notes && (
              <div className="px-6 pb-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Notes</p>
                <p className="text-xs text-zinc-400">{selectedQuote.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
