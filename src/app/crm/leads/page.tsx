'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'

interface Lead {
  id: string
  name: string
  company: string
  jobTitle: string
  phone: string
  source: string
  rating: string
  status: string
  owner: string
  created: string
  score: number
}

const MOCK_LEADS: Lead[] = [
  { id: 'L001', name: 'Maria Garcia', company: 'Fabrikam Inc', jobTitle: 'VP Operations', phone: '+1 555 0401', source: 'Web', rating: 'Hot', status: 'New', owner: 'Alice Chen', created: 'Apr 22', score: 87 },
  { id: 'L002', name: 'James Wilson', company: 'Contoso Corp', jobTitle: 'CEO', phone: '+1 555 0402', source: 'Referral', rating: 'Warm', status: 'Contacted', owner: 'Bob Wilson', created: 'Apr 20', score: 72 },
  { id: 'L003', name: 'Sarah Kim', company: 'Adatum Corp', jobTitle: 'IT Director', phone: '+1 555 0403', source: 'Trade Show', rating: 'Hot', status: 'Qualified', owner: 'Alice Chen', created: 'Apr 18', score: 91 },
  { id: 'L004', name: 'Robert Lee', company: 'Litware Inc', jobTitle: 'CFO', phone: '+1 555 0404', source: 'Phone', rating: 'Cold', status: 'New', owner: 'Carlos M.', created: 'Apr 17', score: 34 },
  { id: 'L005', name: 'Linda Chen', company: 'Northwind', jobTitle: 'Marketing Dir', phone: '+1 555 0405', source: 'Email', rating: 'Warm', status: 'Contacted', owner: 'Alice Chen', created: 'Apr 15', score: 61 },
  { id: 'L006', name: 'Michael Torres', company: 'Alpine Ski House', jobTitle: 'VP Sales', phone: '+1 555 0406', source: 'Web', rating: 'Hot', status: 'Qualified', owner: 'Bob Wilson', created: 'Apr 14', score: 88 },
  { id: 'L007', name: 'Jennifer Park', company: 'Best For You Org', jobTitle: 'Director', phone: '+1 555 0407', source: 'Social', rating: 'Warm', status: 'New', owner: 'Carlos M.', created: 'Apr 13', score: 55 },
  { id: 'L008', name: 'David Martinez', company: 'Blue Yonder', jobTitle: 'CTO', phone: '+1 555 0408', source: 'Referral', rating: 'Hot', status: 'Contacted', owner: 'Alice Chen', created: 'Apr 12', score: 79 },
  { id: 'L009', name: 'Susan Brown', company: 'City Power', jobTitle: 'Procurement Mgr', phone: '+1 555 0409', source: 'Email', rating: 'Cold', status: 'Disqualified', owner: 'Bob Wilson', created: 'Apr 11', score: 22 },
  { id: 'L010', name: 'Kevin Johnson', company: 'Coho Winery', jobTitle: 'Owner', phone: '+1 555 0410', source: 'Trade Show', rating: 'Warm', status: 'Qualified', owner: 'Carlos M.', created: 'Apr 10', score: 68 },
  { id: 'L011', name: 'Patricia White', company: 'Datum Corp', jobTitle: 'CFO', phone: '+1 555 0411', source: 'Web', rating: 'Hot', status: 'New', owner: 'Alice Chen', created: 'Apr 9', score: 83 },
  { id: 'L012', name: 'Christopher Davis', company: 'Fabrikam Fiber', jobTitle: 'VP IT', phone: '+1 555 0412', source: 'Phone', rating: 'Warm', status: 'Contacted', owner: 'Bob Wilson', created: 'Apr 8', score: 64 },
  { id: 'L013', name: 'Amanda Taylor', company: 'Fourth Coffee', jobTitle: 'CEO', phone: '+1 555 0413', source: 'Referral', rating: 'Hot', status: 'Qualified', owner: 'Carlos M.', created: 'Apr 7', score: 92 },
  { id: 'L014', name: 'Daniel Anderson', company: 'Graphic Design Inst.', jobTitle: 'Dir. Operations', phone: '+1 555 0414', source: 'Social', rating: 'Cold', status: 'New', owner: 'Alice Chen', created: 'Apr 6', score: 41 },
  { id: 'L015', name: 'Michelle Jackson', company: 'Humongous Ins.', jobTitle: 'VP Finance', phone: '+1 555 0415', source: 'Email', rating: 'Warm', status: 'Contacted', owner: 'Bob Wilson', created: 'Apr 5', score: 57 },
  { id: 'L016', name: 'Andrew Harris', company: 'Lucerne Publishing', jobTitle: 'COO', phone: '+1 555 0416', source: 'Web', rating: 'Hot', status: 'Qualified', owner: 'Carlos M.', created: 'Apr 4', score: 85 },
  { id: 'L017', name: 'Lisa Martin', company: "Margie's Travel", jobTitle: 'Owner', phone: '+1 555 0417', source: 'Trade Show', rating: 'Cold', status: 'Disqualified', owner: 'Alice Chen', created: 'Apr 3', score: 18 },
  { id: 'L018', name: 'Ryan Thompson', company: 'Munson Pickles', jobTitle: 'Sales Manager', phone: '+1 555 0418', source: 'Referral', rating: 'Warm', status: 'New', owner: 'Bob Wilson', created: 'Apr 2', score: 63 },
  { id: 'L019', name: 'Nicole Garcia', company: 'Northwind Traders', jobTitle: 'IT Manager', phone: '+1 555 0419', source: 'Phone', rating: 'Hot', status: 'Contacted', owner: 'Carlos M.', created: 'Apr 1', score: 77 },
  { id: 'L020', name: 'Brandon Wilson', company: 'Relecloud', jobTitle: 'VP Engineering', phone: '+1 555 0420', source: 'Social', rating: 'Warm', status: 'Qualified', owner: 'Alice Chen', created: 'Mar 31', score: 69 },
]

const RATING_CHIP: Record<string, string> = {
  Hot: 'bg-red-500/20 text-red-400 border border-red-500/30',
  Warm: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  Cold: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
}

const STATUS_CHIP: Record<string, string> = {
  New: 'bg-zinc-700/60 text-zinc-300 border border-zinc-600/40',
  Contacted: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  Qualified: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Disqualified: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

function ScoreBadge({ score }: { score: number }) {
  const cls = score > 75
    ? 'bg-emerald-500/20 text-emerald-400'
    : score >= 50
      ? 'bg-amber-500/20 text-amber-400'
      : 'bg-zinc-700/50 text-zinc-400'
  return (
    <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold ${cls}`}>
      {score}
    </span>
  )
}

const BPF_STAGES = ['Qualify', 'Develop', 'Propose', 'Close']

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [ratingFilter, setRatingFilter] = useState('All')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortCol, setSortCol] = useState<keyof Lead>('created')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetch('/api/crm/leads')
      .then(r => r.json())
      .then(data => { if (data?.leads?.length) setLeads(data.leads) })
      .catch(() => {})
  }, [])

  const filtered = leads.filter(l => {
    const matchSearch = search === '' ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase())
    const matchSource = sourceFilter === 'All' || l.source === sourceFilter
    const matchStatus = statusFilter === 'All' || l.status === statusFilter
    const matchRating = ratingFilter === 'All' || l.rating === ratingFilter
    return matchSearch && matchSource && matchStatus && matchRating
  })

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortCol]
    const bv = b[sortCol]
    if (av === undefined || bv === undefined) return 0
    const cmp = String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? cmp : -cmp
  })

  function toggleSort(col: keyof Lead) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  function toggleAll() {
    if (selected.size === sorted.length) setSelected(new Set())
    else setSelected(new Set(sorted.map(l => l.id)))
  }

  function toggleOne(id: string) {
    const s = new Set(selected)
    if (s.has(id)) s.delete(id)
    else s.add(id)
    setSelected(s)
  }

  const kpiNew = leads.filter(l => l.status === 'New').length
  const kpiContacted = leads.filter(l => l.status === 'Contacted').length
  const kpiQualified = leads.filter(l => l.status === 'Qualified').length
  const kpiDisqualified = leads.filter(l => l.status === 'Disqualified').length

  const SortIcon = ({ col }: { col: keyof Lead }) => (
    <span className="ml-1 opacity-50 text-[10px]">
      {sortCol === col ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  )

  const actions = (
    <>
      <Link href="/crm/leads/new">
        <button style={{ background: 'rgba(99,102,241,0.85)', color: '#fff' }}
          className="px-3 py-1.5 rounded text-xs font-medium hover:opacity-90 transition">
          + New Lead
        </button>
      </Link>
      {['Qualify', 'Disqualify', 'Import'].map(lbl => (
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
        title="Leads"
        breadcrumb={[{ label: 'CRM', href: '/crm' }]}
        actions={actions}
      />

      {/* Business Process Flow */}
      <div className="px-6 pt-4">
        <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}
          className="rounded-lg p-3 flex items-center gap-0">
          {BPF_STAGES.map((stage, i) => (
            <div key={stage} className="flex items-center flex-1">
              <div className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-sm text-xs font-medium transition
                ${i === 0 ? 'text-indigo-300' : 'text-zinc-500'}`}
                style={i === 0 ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' } : {}}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 18, height: 18, borderRadius: '50%',
                  background: i === 0 ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.05)',
                  fontSize: 10, fontWeight: 700, color: i === 0 ? '#a5b4fc' : '#475569'
                }}>
                  {i + 1}
                </span>
                {stage}
              </div>
              {i < BPF_STAGES.length - 1 && (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                  <path d="M6 10h8M11 7l3 3-3 3" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline KPIs */}
      <div className="px-6 pt-3 flex gap-3">
        {[
          { label: 'New', count: kpiNew, color: 'rgba(148,163,184,0.08)', text: '#94a3b8' },
          { label: 'Contacted', count: kpiContacted, color: 'rgba(99,102,241,0.1)', text: '#a5b4fc' },
          { label: 'Qualified', count: kpiQualified, color: 'rgba(16,185,129,0.1)', text: '#6ee7b7' },
          { label: 'Disqualified', count: kpiDisqualified, color: 'rgba(239,68,68,0.08)', text: '#fca5a5' },
        ].map(kpi => (
          <div key={kpi.label}
            style={{ background: kpi.color, border: '1px solid rgba(99,102,241,0.12)' }}
            className="flex-1 rounded-lg px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs" style={{ color: '#94a3b8' }}>{kpi.label}</span>
            <span className="text-sm font-bold" style={{ color: kpi.text }}>{kpi.count} leads</span>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="px-6 pt-3 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name or company…"
          className="px-3 py-1.5 rounded text-xs outline-none w-48"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
        />
        {[
          { label: 'Source', value: sourceFilter, set: setSourceFilter, opts: ['All', 'Web', 'Phone', 'Email', 'Referral', 'Trade Show', 'Social'] },
          { label: 'Status', value: statusFilter, set: setStatusFilter, opts: ['All', 'New', 'Contacted', 'Qualified', 'Disqualified'] },
          { label: 'Rating', value: ratingFilter, set: setRatingFilter, opts: ['All', 'Hot', 'Warm', 'Cold'] },
        ].map(f => (
          <select key={f.label} value={f.value} onChange={e => f.set(e.target.value)}
            className="px-3 py-1.5 rounded text-xs outline-none"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}>
            {f.opts.map(o => <option key={o} value={o} style={{ background: '#16213e' }}>{o === 'All' ? `${f.label}: All` : o}</option>)}
          </select>
        ))}
        <input
          type="text"
          placeholder="Owner"
          className="px-3 py-1.5 rounded text-xs outline-none w-32"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
        />
        <div className="flex gap-1">
          <input
            type="date"
            className="px-2 py-1.5 rounded text-xs outline-none"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}
          />
          <input
            type="date"
            className="px-2 py-1.5 rounded text-xs outline-none"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pt-4 pb-8">
        <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }} className="rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                  <th className="w-8 py-2.5 px-3">
                    <input type="checkbox" checked={selected.size === sorted.length && sorted.length > 0}
                      onChange={toggleAll} className="accent-indigo-500" />
                  </th>
                  {([
                    ['name', 'Lead Name'],
                    ['company', 'Company'],
                    ['jobTitle', 'Job Title'],
                    ['phone', 'Phone'],
                    ['source', 'Source'],
                    ['rating', 'Rating'],
                    ['status', 'Status'],
                    ['owner', 'Owner'],
                    ['created', 'Created'],
                    ['score', 'Score'],
                  ] as [keyof Lead, string][]).map(([col, label]) => (
                    <th key={col}
                      onClick={() => toggleSort(col)}
                      className="py-2.5 px-3 text-left font-medium cursor-pointer select-none whitespace-nowrap"
                      style={{ color: '#94a3b8' }}>
                      {label}<SortIcon col={col} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(lead => (
                  <tr key={lead.id}
                    style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}
                    className="hover:bg-indigo-500/5 transition-colors cursor-pointer">
                    <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleOne(lead.id)} className="accent-indigo-500" />
                    </td>
                    <td className="py-2.5 px-3">
                      <Link href={`/crm/leads/${lead.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300">{lead.company}</td>
                    <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>{lead.jobTitle}</td>
                    <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>{lead.phone}</td>
                    <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>{lead.source}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${RATING_CHIP[lead.rating] || ''}`}>
                        {lead.rating}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_CHIP[lead.status] || ''}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>{lead.owner}</td>
                    <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>{lead.created}</td>
                    <td className="py-2.5 px-3">
                      <ScoreBadge score={lead.score} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
            <span className="text-xs" style={{ color: '#94a3b8' }}>1-20 of 156 records</span>
            <div className="flex gap-1">
              {['‹', '1', '2', '3', '...', '8', '›'].map((p, i) => (
                <button key={i}
                  className="w-7 h-7 rounded text-xs flex items-center justify-center transition"
                  style={p === '1'
                    ? { background: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }
                    : { background: 'rgba(99,102,241,0.06)', color: '#94a3b8', border: '1px solid rgba(99,102,241,0.1)' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
