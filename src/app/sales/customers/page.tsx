'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import TopBar from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

type Customer = {
  id: string
  no: string
  name: string
  group: string
  phone: string
  balance: number
  creditLimit: number
  blocked: '' | 'Credit' | 'All'
  rep: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CUSTOMERS: Customer[] = [
  { id: 'c10000', no: 'C10000', name: 'The Cannon Group PLC', group: 'Large Corp', phone: '+1 555 0100', balance: 8432.10, creditLimit: 50000, blocked: '', rep: 'John Smith' },
  { id: 'c20000', no: 'C20000', name: 'Selangorian Ltd.', group: 'Import/Export', phone: '+44 20 0200', balance: 2184.90, creditLimit: 20000, blocked: '', rep: 'Alice Chen' },
  { id: 'c30000', no: 'C30000', name: 'Blanemark Inc.', group: 'Retail', phone: '+1 555 0300', balance: 0.00, creditLimit: 10000, blocked: '', rep: 'Bob Wilson' },
  { id: 'c40000', no: 'C40000', name: 'Trey Research', group: 'Technology', phone: '+1 555 0400', balance: 15200.00, creditLimit: 100000, blocked: 'Credit', rep: 'Carlos Mendez' },
  { id: 'c50000', no: 'C50000', name: 'School of Fine Art', group: 'Education', phone: '+1 555 0500', balance: 847.50, creditLimit: 5000, blocked: '', rep: 'Sarah Lopez' },
  { id: 'c60000', no: 'C60000', name: 'Fabrikam Inc', group: 'Manufacturing', phone: '+1 555 0600', balance: 24300.00, creditLimit: 80000, blocked: '', rep: 'Alice Chen' },
  { id: 'c70000', no: 'C70000', name: 'Adatum Corp', group: 'Distribution', phone: '+1 555 0700', balance: 8750.00, creditLimit: 40000, blocked: '', rep: 'Bob Wilson' },
  { id: 'c80000', no: 'C80000', name: 'Contoso Ltd', group: 'Large Corp', phone: '+1 555 0800', balance: -3200.00, creditLimit: 200000, blocked: '', rep: 'John Smith' },
  { id: 'c90000', no: 'C90000', name: 'Litware Inc', group: 'Technology', phone: '+1 555 0900', balance: 22100.00, creditLimit: 30000, blocked: 'Credit', rep: 'Carlos Mendez' },
  { id: 'c10100', no: 'C10100', name: 'Northwind Traders', group: 'Retail', phone: '+1 555 0101', balance: 12875.00, creditLimit: 60000, blocked: '', rep: 'Sarah Lopez' },
  { id: 'c10200', no: 'C10200', name: 'Alpine Ski House', group: 'Hospitality', phone: '+1 555 0102', balance: 5490.00, creditLimit: 15000, blocked: '', rep: 'Alice Chen' },
  { id: 'c10300', no: 'C10300', name: 'Wide World Importers', group: 'Import/Export', phone: '+1 555 0103', balance: 88100.00, creditLimit: 150000, blocked: '', rep: 'Bob Wilson' },
  { id: 'c10400', no: 'C10400', name: 'Tailspin Toys', group: 'Retail', phone: '+1 555 0104', balance: 5800.00, creditLimit: 25000, blocked: '', rep: 'John Smith' },
  { id: 'c10500', no: 'C10500', name: 'The Phone Company', group: 'Telecom', phone: '+1 555 0105', balance: 0.00, creditLimit: 75000, blocked: 'All', rep: 'Carlos Mendez' },
  { id: 'c10600', no: 'C10600', name: 'Coho Winery', group: 'Food & Bev', phone: '+1 555 0106', balance: 18750.00, creditLimit: 35000, blocked: '', rep: 'Sarah Lopez' },
  { id: 'c10700', no: 'C10700', name: 'Relecloud', group: 'Technology', phone: '+1 555 0107', balance: 93200.00, creditLimit: 250000, blocked: '', rep: 'Alice Chen' },
  { id: 'c10800', no: 'C10800', name: 'Fourth Coffee', group: 'Food & Bev', phone: '+1 555 0108', balance: 7600.00, creditLimit: 20000, blocked: '', rep: 'Bob Wilson' },
  { id: 'c10900', no: 'C10900', name: 'Humongous Insurance', group: 'Insurance', phone: '+1 555 0109', balance: 340000.00, creditLimit: 500000, blocked: '', rep: 'John Smith' },
  { id: 'c11000', no: 'C11000', name: 'Woodgrove Bank', group: 'Financial Services', phone: '+1 555 0110', balance: 28400.00, creditLimit: 100000, blocked: 'Credit', rep: 'Carlos Mendez' },
  { id: 'c11100', no: 'C11100', name: 'Bellows College', group: 'Education', phone: '+1 555 0111', balance: 11200.00, creditLimit: 30000, blocked: '', rep: 'Sarah Lopez' },
  { id: 'c11200', no: 'C11200', name: 'Proseware Inc', group: 'Technology', phone: '+1 555 0112', balance: 54600.00, creditLimit: 90000, blocked: '', rep: 'Alice Chen' },
  { id: 'c11300', no: 'C11300', name: 'Lucerne Publishing', group: 'Media', phone: '+1 555 0113', balance: 19300.00, creditLimit: 40000, blocked: '', rep: 'Bob Wilson' },
  { id: 'c11400', no: 'C11400', name: 'Adventure Works', group: 'Distribution', phone: '+1 555 0114', balance: 76800.00, creditLimit: 120000, blocked: '', rep: 'John Smith' },
  { id: 'c11500', no: 'C11500', name: 'City Power & Light', group: 'Utilities', phone: '+1 555 0115', balance: -1500.00, creditLimit: 200000, blocked: '', rep: 'Carlos Mendez' },
  { id: 'c11600', no: 'C11600', name: 'VanArsdel Ltd.', group: 'Manufacturing', phone: '+1 555 0116', balance: 33900.00, creditLimit: 70000, blocked: '', rep: 'Sarah Lopez' },
]

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

const GROUPS = ['All', 'Large Corp', 'Technology', 'Retail', 'Education', 'Import/Export', 'Manufacturing', 'Distribution', 'Financial Services', 'Food & Bev', 'Hospitality', 'Telecom', 'Insurance', 'Media', 'Utilities']
const BALANCE_FILTERS = ['All', 'With Balance', 'Overdue']
const CREDIT_STATUSES = ['All', 'None', 'Credit', 'Blocked']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [_apiData, setApiData] = useState<unknown>(null)
  const [nameSearch, setNameSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('All')
  const [balanceFilter, setBalanceFilter] = useState('All')
  const [creditFilter, setCreditFilter] = useState('All')
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [rowCount, setRowCount] = useState(25)

  useEffect(() => {
    fetch('/api/sales/customers')
      .then(r => r.json())
      .then(d => setApiData(d))
      .catch(() => {})
  }, [])

  const filtered = CUSTOMERS.filter(c => {
    const matchName = !nameSearch || c.name.toLowerCase().includes(nameSearch.toLowerCase()) || c.no.toLowerCase().includes(nameSearch.toLowerCase())
    const matchGroup = groupFilter === 'All' || c.group === groupFilter
    const matchBalance = balanceFilter === 'All' || (balanceFilter === 'With Balance' ? c.balance > 0 : c.balance < 0)
    const matchCredit = creditFilter === 'All' || (creditFilter === 'None' ? !c.blocked : c.blocked === creditFilter)
    return matchName && matchGroup && matchBalance && matchCredit
  }).slice(0, rowCount)

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const toggleAll = () => {
    if (checked.size === filtered.length) setChecked(new Set())
    else setChecked(new Set(filtered.map(c => c.id)))
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Customers"
        breadcrumb={[
          { label: 'Sales', href: '/sales' },
          { label: 'Customers', href: '/sales/customers' },
        ]}
        actions={
          <>
            <button className="px-3 py-1.5 rounded text-xs font-medium text-white" style={{ background: 'rgba(99,102,241,0.75)' }}>
              New
            </button>
            <button className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}>
              Delete
            </button>
            <button className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}>
              Statement
            </button>
            <button className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}>
              Navigate
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
            className="h-8 rounded px-3 text-xs w-32 outline-none"
            style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            placeholder="Customer No."
          />
          <input
            className="h-8 rounded px-3 text-xs w-44 outline-none"
            style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            placeholder="Name search"
            value={nameSearch}
            onChange={e => setNameSearch(e.target.value)}
          />
          <select
            className="h-8 rounded px-3 text-xs outline-none"
            style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
          >
            {GROUPS.map(g => <option key={g}>{g}</option>)}
          </select>
          <select
            className="h-8 rounded px-3 text-xs outline-none"
            style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            value={balanceFilter}
            onChange={e => setBalanceFilter(e.target.value)}
          >
            {BALANCE_FILTERS.map(b => <option key={b}>{b}</option>)}
          </select>
          <select
            className="h-8 rounded px-3 text-xs outline-none"
            style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            value={creditFilter}
            onChange={e => setCreditFilter(e.target.value)}
          >
            {CREDIT_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
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
                {['Customer No.', 'Name', 'Customer Group', 'Phone', 'Balance ($)', 'Credit Limit', 'Blocked', 'Sales Rep'].map(h => (
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
              {filtered.map((c, i) => {
                const isCreditHold = c.blocked === 'Credit'
                const isFullBlock = c.blocked === 'All'
                return (
                  <tr
                    key={c.id}
                    className="transition-colors"
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none',
                      background: isCreditHold ? 'rgba(245,158,11,0.04)' : isFullBlock ? 'rgba(239,68,68,0.04)' : 'transparent',
                    }}
                  >
                    <td className="px-4 py-3" onClick={() => toggleCheck(c.id)}>
                      <input type="checkbox" className="accent-indigo-500 cursor-pointer" checked={checked.has(c.id)} onChange={() => {}} />
                    </td>
                    <td className="px-4 py-3 font-mono text-indigo-300">
                      <Link href={`/sales/customers/${c.id}`} className="hover:text-indigo-200 transition-colors">{c.no}</Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-200 font-medium">
                      <Link href={`/sales/customers/${c.id}`} className="hover:text-white transition-colors">{c.name}</Link>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{c.group}</td>
                    <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{c.phone}</td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: c.balance < 0 ? '#f87171' : '#e2e8f0' }}>
                      {fmtCurrency(c.balance)}
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: '#94a3b8' }}>{fmtCurrency(c.creditLimit)}</td>
                    <td className="px-4 py-3">
                      {c.blocked === 'Credit' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">Credit</span>
                      ) : c.blocked === 'All' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/20 text-red-400 border border-red-500/30">All</span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#10b981' }} />
                          <span style={{ color: '#94a3b8' }}>—</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{c.rep}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs" style={{ color: '#94a3b8' }}>
          <div className="flex items-center gap-2">
            <span>1–{Math.min(rowCount, filtered.length)} of 1,247</span>
            <select
              className="h-7 rounded px-2 text-xs outline-none ml-3"
              style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}
              value={rowCount}
              onChange={e => setRowCount(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, '...', 50].map((p, i) => (
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
    </div>
  )
}
