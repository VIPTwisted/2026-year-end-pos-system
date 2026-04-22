'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ── Types ──────────────────────────────────────────────────────────────────
type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
type MemberStatus = 'Active' | 'Inactive'

interface Member {
  id: string
  memberNum: string
  name: string
  tier: Tier
  points: number
  ytdSpend: number
  lastActivity: string
  enrolled: string
  status: MemberStatus
  email: string
  phone: string
}

interface ActivityEvent {
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted' | 'bonus'
  pts: number
  label: string
  date: string
}

interface Redemption { date: string; amount: number; transaction: string }
interface Transaction { date: string; desc: string; amount: number }

// ── Static data ────────────────────────────────────────────────────────────
const SEED_MEMBERS: Member[] = [
  { id: '1',  memberNum: 'LM-00001', name: 'Sarah Martinez',  tier: 'Gold',     points: 8420,  ytdSpend: 4210,  lastActivity: 'Apr 22', enrolled: 'Jan 2022', status: 'Active',   email: 'sarah.martinez@email.com',  phone: '(512) 555-0101' },
  { id: '2',  memberNum: 'LM-00002', name: 'James Chen',      tier: 'Platinum', points: 24100, ytdSpend: 12050, lastActivity: 'Apr 21', enrolled: 'Mar 2019', status: 'Active',   email: 'james.chen@email.com',      phone: '(512) 555-0102' },
  { id: '3',  memberNum: 'LM-00003', name: 'Lisa Park',       tier: 'Silver',   points: 2840,  ytdSpend: 1420,  lastActivity: 'Apr 18', enrolled: 'Aug 2023', status: 'Active',   email: 'lisa.park@email.com',       phone: '(512) 555-0103' },
  { id: '4',  memberNum: 'LM-00004', name: 'Robert Johnson',  tier: 'Bronze',   points: 320,   ytdSpend: 160,   lastActivity: 'Mar 5',  enrolled: 'Feb 2024', status: 'Inactive', email: 'robert.johnson@email.com',  phone: '(512) 555-0104' },
  { id: '5',  memberNum: 'LM-00005', name: 'Maria Garcia',    tier: 'Gold',     points: 6841,  ytdSpend: 3420,  lastActivity: 'Apr 20', enrolled: 'Jun 2021', status: 'Active',   email: 'maria.garcia@email.com',    phone: '(512) 555-0105' },
  { id: '6',  memberNum: 'LM-00006', name: 'Kevin Turner',    tier: 'Silver',   points: 3120,  ytdSpend: 1560,  lastActivity: 'Apr 19', enrolled: 'Nov 2022', status: 'Active',   email: 'kevin.turner@email.com',    phone: '(512) 555-0106' },
  { id: '7',  memberNum: 'LM-00007', name: 'Amy Johnson',     tier: 'Bronze',   points: 480,   ytdSpend: 240,   lastActivity: 'Apr 10', enrolled: 'Jan 2024', status: 'Active',   email: 'amy.johnson@email.com',     phone: '(512) 555-0107' },
  { id: '8',  memberNum: 'LM-00008', name: 'David Park',      tier: 'Gold',     points: 7240,  ytdSpend: 3620,  lastActivity: 'Apr 19', enrolled: 'Apr 2020', status: 'Active',   email: 'david.park@email.com',      phone: '(512) 555-0108' },
  { id: '9',  memberNum: 'LM-00009', name: 'Nina Patel',      tier: 'Platinum', points: 18400, ytdSpend: 9200,  lastActivity: 'Apr 20', enrolled: 'Sep 2018', status: 'Active',   email: 'nina.patel@email.com',      phone: '(512) 555-0109' },
  { id: '10', memberNum: 'LM-00010', name: 'Carlos Rivera',   tier: 'Silver',   points: 1920,  ytdSpend: 960,   lastActivity: 'Apr 21', enrolled: 'May 2023', status: 'Active',   email: 'carlos.rivera@email.com',   phone: '(512) 555-0110' },
  { id: '11', memberNum: 'LM-00011', name: 'Grace Kim',       tier: 'Gold',     points: 5100,  ytdSpend: 2550,  lastActivity: 'Apr 22', enrolled: 'Jul 2021', status: 'Active',   email: 'grace.kim@email.com',       phone: '(512) 555-0111' },
  { id: '12', memberNum: 'LM-00012', name: 'Tom Walsh',       tier: 'Bronze',   points: 240,   ytdSpend: 120,   lastActivity: 'Feb 28', enrolled: 'Mar 2024', status: 'Inactive', email: 'tom.walsh@email.com',       phone: '(512) 555-0112' },
  { id: '13', memberNum: 'LM-00013', name: 'Linda Nguyen',    tier: 'Silver',   points: 2210,  ytdSpend: 1105,  lastActivity: 'Apr 21', enrolled: 'Oct 2022', status: 'Active',   email: 'linda.nguyen@email.com',    phone: '(512) 555-0113' },
  { id: '14', memberNum: 'LM-00014', name: 'Ethan Brooks',    tier: 'Gold',     points: 6020,  ytdSpend: 3010,  lastActivity: 'Apr 20', enrolled: 'Feb 2021', status: 'Active',   email: 'ethan.brooks@email.com',    phone: '(512) 555-0114' },
  { id: '15', memberNum: 'LM-00015', name: 'Rachel Adams',    tier: 'Silver',   points: 3400,  ytdSpend: 1700,  lastActivity: 'Apr 16', enrolled: 'Dec 2022', status: 'Active',   email: 'rachel.adams@email.com',    phone: '(512) 555-0115' },
  { id: '16', memberNum: 'LM-00016', name: 'Brian Scott',     tier: 'Platinum', points: 31200, ytdSpend: 15600, lastActivity: 'Apr 22', enrolled: 'Jan 2018', status: 'Active',   email: 'brian.scott@email.com',     phone: '(512) 555-0116' },
  { id: '17', memberNum: 'LM-00017', name: 'Michelle Lee',    tier: 'Gold',     points: 9840,  ytdSpend: 4920,  lastActivity: 'Apr 18', enrolled: 'May 2020', status: 'Active',   email: 'michelle.lee@email.com',    phone: '(512) 555-0117' },
  { id: '18', memberNum: 'LM-00018', name: 'Jason White',     tier: 'Bronze',   points: 680,   ytdSpend: 340,   lastActivity: 'Mar 20', enrolled: 'Sep 2023', status: 'Active',   email: 'jason.white@email.com',     phone: '(512) 555-0118' },
  { id: '19', memberNum: 'LM-00019', name: 'Stephanie Clark', tier: 'Silver',   points: 2780,  ytdSpend: 1390,  lastActivity: 'Apr 17', enrolled: 'Dec 2022', status: 'Active',   email: 'stephanie.clark@email.com', phone: '(512) 555-0119' },
  { id: '20', memberNum: 'LM-00020', name: 'Alex Rodriguez',  tier: 'Gold',     points: 7600,  ytdSpend: 3800,  lastActivity: 'Apr 19', enrolled: 'Mar 2021', status: 'Active',   email: 'alex.rodriguez@email.com',  phone: '(512) 555-0120' },
  { id: '21', memberNum: 'LM-00021', name: 'Monica Brown',    tier: 'Silver',   points: 1840,  ytdSpend: 920,   lastActivity: 'Apr 20', enrolled: 'Aug 2023', status: 'Active',   email: 'monica.brown@email.com',    phone: '(512) 555-0121' },
  { id: '22', memberNum: 'LM-00022', name: 'Tyler Wilson',    tier: 'Bronze',   points: 420,   ytdSpend: 210,   lastActivity: 'Jan 14', enrolled: 'Nov 2023', status: 'Inactive', email: 'tyler.wilson@email.com',    phone: '(512) 555-0122' },
  { id: '23', memberNum: 'LM-00023', name: 'Ashley Thomas',   tier: 'Gold',     points: 4920,  ytdSpend: 2460,  lastActivity: 'Apr 21', enrolled: 'Apr 2022', status: 'Active',   email: 'ashley.thomas@email.com',   phone: '(512) 555-0123' },
  { id: '24', memberNum: 'LM-00024', name: 'Chris Harris',    tier: 'Platinum', points: 22500, ytdSpend: 11250, lastActivity: 'Apr 22', enrolled: 'Jul 2019', status: 'Active',   email: 'chris.harris@email.com',    phone: '(512) 555-0124' },
  { id: '25', memberNum: 'LM-00025', name: 'Samantha Young',  tier: 'Silver',   points: 3060,  ytdSpend: 1530,  lastActivity: 'Apr 17', enrolled: 'Jan 2023', status: 'Active',   email: 'samantha.young@email.com',  phone: '(512) 555-0125' },
]

const ACTIVITY: ActivityEvent[] = [
  { type: 'earned',   pts: 42,    label: 'Purchase $42.00',             date: 'Apr 22 10:41' },
  { type: 'bonus',    pts: 5,     label: 'Bonus Tuesday promotion',     date: 'Apr 22 10:41' },
  { type: 'redeemed', pts: -500,  label: 'Redeemed $5 reward',          date: 'Apr 15 14:22' },
  { type: 'earned',   pts: 127,   label: 'Purchase $127.47',            date: 'Apr 12 11:08' },
  { type: 'adjusted', pts: 100,   label: 'CS goodwill adjustment',      date: 'Apr 10 09:00' },
  { type: 'earned',   pts: 84,    label: 'Purchase $84.98',             date: 'Apr 05 16:45' },
  { type: 'expired',  pts: -200,  label: '200 pts expired (180 days)',  date: 'Apr 01 00:00' },
  { type: 'earned',   pts: 312,   label: 'Purchase $312.45',            date: 'Mar 28 13:30' },
  { type: 'redeemed', pts: -1000, label: 'Redeemed $10 reward',         date: 'Mar 20 11:15' },
  { type: 'bonus',    pts: 250,   label: 'Birthday bonus',              date: 'Mar 15 00:01' },
]

const REDEMPTIONS: Redemption[] = [
  { date: 'Apr 15', amount: 5.00,  transaction: 'TXN-2026-8211' },
  { date: 'Mar 20', amount: 10.00, transaction: 'TXN-2026-7841' },
  { date: 'Feb 28', amount: 5.00,  transaction: 'TXN-2026-6340' },
  { date: 'Jan 30', amount: 15.00, transaction: 'TXN-2026-5201' },
  { date: 'Jan 05', amount: 10.00, transaction: 'TXN-2026-4100' },
]

const TRANSACTIONS: Transaction[] = [
  { date: 'Apr 22', desc: 'Widget Assembly A100 x3',  amount: 127.47 },
  { date: 'Apr 12', desc: 'Control Panel C300',        amount: 84.98  },
  { date: 'Apr 05', desc: 'Sensor Module D400 x2',     amount: 84.98  },
  { date: 'Mar 28', desc: 'Power Supply F600 x5',      amount: 312.45 },
  { date: 'Mar 15', desc: 'Motor Housing B200',         amount: 49.99  },
  { date: 'Mar 02', desc: 'Cable Assembly E500',        amount: 64.50  },
  { date: 'Feb 18', desc: 'Fan Assembly I900 x2',       amount: 98.00  },
  { date: 'Feb 05', desc: 'Display Unit G700',          amount: 220.00 },
  { date: 'Jan 22', desc: 'PCB Board H800',             amount: 145.00 },
  { date: 'Jan 05', desc: 'Battery Pack J100 x3',       amount: 75.00  },
]

// ── Badge helpers ──────────────────────────────────────────────────────────
const TIER_BADGE: Record<Tier, string> = {
  Bronze:   'bg-stone-500/15 text-stone-300 border-stone-500/30',
  Silver:   'bg-slate-500/15 text-slate-300 border-slate-500/30',
  Gold:     'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Platinum: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
}

const ACTIVITY_COLOR: Record<string, string> = {
  earned:   'text-emerald-400',
  bonus:    'text-blue-400',
  redeemed: 'text-amber-400',
  expired:  'text-red-400',
  adjusted: 'text-indigo-400',
}

// ── Component ──────────────────────────────────────────────────────────────
export default function LoyaltyMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filtered, setFiltered] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [drawer, setDrawer] = useState<Member | null>(null)
  const [drawerTab, setDrawerTab] = useState<'activity' | 'redemptions' | 'transactions' | 'notes'>('activity')
  const [notes, setNotes] = useState('')
  const [issueModal, setIssueModal] = useState(false)
  const [issuePoints, setIssuePoints] = useState('')
  const [issueReason, setIssueReason] = useState('Customer Goodwill')
  const [issueNotes, setIssueNotes] = useState('')

  useEffect(() => {
    fetch('/api/loyalty/members')
      .then(r => r.json())
      .then(() => { setMembers(SEED_MEMBERS); setFiltered(SEED_MEMBERS); setLoading(false) })
      .catch(() => { setMembers(SEED_MEMBERS); setFiltered(SEED_MEMBERS); setLoading(false) })
  }, [])

  useEffect(() => {
    let data = [...members]
    if (filterTier !== 'All') data = data.filter(m => m.tier === filterTier)
    if (filterStatus !== 'All') data = data.filter(m => m.status === filterStatus)
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(m => m.name.toLowerCase().includes(q) || m.memberNum.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
    }
    setFiltered(data)
  }, [members, search, filterTier, filterStatus])

  const toggleRow = (id: string) => setSelectedRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => selectedRows.size === filtered.length ? setSelectedRows(new Set()) : setSelectedRows(new Set(filtered.map(m => m.id)))

  const actions = (
    <>
      <button className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">Enroll New Member</button>
      <button className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#16213e] hover:bg-[#1e2d4a] text-[#e2e8f0] border border-[rgba(99,102,241,0.3)] transition-colors" onClick={() => setIssueModal(true)}>Issue Points</button>
      <button className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#16213e] hover:bg-[#1e2d4a] text-[#e2e8f0] border border-[rgba(99,102,241,0.3)] transition-colors">Void Points</button>
      <button className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#16213e] hover:bg-[#1e2d4a] text-[#e2e8f0] border border-[rgba(99,102,241,0.3)] transition-colors">Export</button>
    </>
  )

  return (
    <div className="flex flex-col min-h-[100dvh]" style={{ background: '#0d0e24' }}>
      <TopBar
        title="Loyalty Members"
        breadcrumb={[{ label: 'Loyalty', href: '/loyalty' }, { label: 'Members', href: '/loyalty/members' }]}
        actions={actions}
      />

      <main className="flex-1 p-6 space-y-5">

        {/* KPI Strip */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Members',          value: '8,247',   color: 'text-indigo-400' },
            { label: 'Active (30d)',            value: '2,841',   color: 'text-emerald-400' },
            { label: 'Avg Points Balance',      value: '584 pts', color: 'text-amber-400' },
            { label: 'Redemptions This Month',  value: '$2,840',  color: 'text-teal-400' },
          ].map(k => (
            <div key={k.label} className="rounded-lg p-4" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-[11px] text-[#94a3b8] mb-1">{k.label}</p>
              <p className={`text-2xl font-semibold tabular-nums ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 items-center" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '0.5rem', padding: '0.75rem 1rem' }}>
          <input className="px-3 py-1.5 rounded-md text-[12px] bg-[#0d0e24] border border-[rgba(99,102,241,0.3)] text-[#e2e8f0] placeholder-[#94a3b8] outline-none focus:border-indigo-500 w-32" placeholder="Member #" />
          <input className="px-3 py-1.5 rounded-md text-[12px] bg-[#0d0e24] border border-[rgba(99,102,241,0.3)] text-[#e2e8f0] placeholder-[#94a3b8] outline-none focus:border-indigo-500 w-36" placeholder="Name" value={search} onChange={e => setSearch(e.target.value)} />
          <input className="px-3 py-1.5 rounded-md text-[12px] bg-[#0d0e24] border border-[rgba(99,102,241,0.3)] text-[#e2e8f0] placeholder-[#94a3b8] outline-none focus:border-indigo-500 w-44" placeholder="Email" />
          <input className="px-3 py-1.5 rounded-md text-[12px] bg-[#0d0e24] border border-[rgba(99,102,241,0.3)] text-[#e2e8f0] placeholder-[#94a3b8] outline-none focus:border-indigo-500 w-32" placeholder="Phone" />
          <select className="px-3 py-1.5 rounded-md text-[12px] bg-[#0d0e24] border border-[rgba(99,102,241,0.3)] text-[#e2e8f0] outline-none focus:border-indigo-500" value={filterTier} onChange={e => setFilterTier(e.target.value)}>
            {['All', 'Bronze', 'Silver', 'Gold', 'Platinum'].map(t => <option key={t} value={t}>{t === 'All' ? 'All Tiers' : t}</option>)}
          </select>
          <select className="px-3 py-1.5 rounded-md text-[12px] bg-[#0d0e24] border border-[rgba(99,102,241,0.3)] text-[#e2e8f0] outline-none focus:border-indigo-500" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {['All', 'Active', 'Inactive'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
          <input className="px-3 py-1.5 rounded-md text-[12px] bg-[#0d0e24] border border-[rgba(99,102,241,0.3)] text-[#e2e8f0] placeholder-[#94a3b8] outline-none focus:border-indigo-500 flex-1 min-w-[140px]" placeholder="Search members..." />
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#94a3b8] text-sm">Loading members...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-[#94a3b8]">
                      <input type="checkbox" className="rounded" checked={selectedRows.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
                    </th>
                    {['Member #', 'Name', 'Tier', 'Points', 'YTD Spend', 'Last Activity', 'Enrolled', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-[#94a3b8] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, idx) => (
                    <tr
                      key={m.id}
                      className="hover:bg-[rgba(99,102,241,0.05)] cursor-pointer transition-colors"
                      style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(99,102,241,0.08)' : undefined }}
                      onClick={() => { setDrawer(m); setDrawerTab('activity') }}
                    >
                      <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleRow(m.id) }}>
                        <input type="checkbox" className="rounded" checked={selectedRows.has(m.id)} onChange={() => toggleRow(m.id)} />
                      </td>
                      <td className="px-4 py-3 font-mono text-indigo-400 text-[12px]">{m.memberNum}</td>
                      <td className="px-4 py-3 text-[#e2e8f0]">{m.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${TIER_BADGE[m.tier]}`}>{m.tier}</span>
                      </td>
                      <td className="px-4 py-3 text-amber-400 font-medium tabular-nums">{m.points.toLocaleString()}</td>
                      <td className="px-4 py-3 text-emerald-400 tabular-nums">${m.ytdSpend.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#94a3b8]">{m.lastActivity}</td>
                      <td className="px-4 py-3 text-[#94a3b8]">{m.enrolled}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${m.status === 'Active' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-slate-500/15 text-slate-400 border-slate-500/30'}`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* Member Detail Drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDrawer(null)}>
          <div className="w-[480px] h-full overflow-y-auto flex flex-col" style={{ background: '#0d0e24', borderLeft: '1px solid rgba(99,102,241,0.3)' }} onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold text-[#e2e8f0]">{drawer.name}</h2>
                <button onClick={() => setDrawer(null)} className="text-[#94a3b8] hover:text-[#e2e8f0] text-xl leading-none">x</button>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${TIER_BADGE[drawer.tier]}`}>{drawer.tier}</span>
                <span className="text-[11px] text-[#94a3b8]">Member since {drawer.enrolled}</span>
                <span className="text-[11px] font-mono text-indigo-400">{drawer.memberNum}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="text-center">
                <p className="text-[11px] text-[#94a3b8] mb-1">Points Balance</p>
                <p className="text-xl font-semibold text-amber-400 tabular-nums">{drawer.points.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-[#94a3b8] mb-1">YTD Spend</p>
                <p className="text-xl font-semibold text-emerald-400 tabular-nums">${drawer.ytdSpend.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-[#94a3b8] mb-1">Lifetime Spend</p>
                <p className="text-xl font-semibold text-teal-400 tabular-nums">${(drawer.ytdSpend * 2.8).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>

            <div className="flex" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
              {(['activity', 'redemptions', 'transactions', 'notes'] as const).map(tab => (
                <button key={tab} className={`flex-1 py-2.5 text-[12px] font-medium capitalize transition-colors ${drawerTab === tab ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-[#94a3b8] hover:text-[#e2e8f0]'}`} onClick={() => setDrawerTab(tab)}>{tab}</button>
              ))}
            </div>

            <div className="flex-1 px-6 py-4">
              {drawerTab === 'activity' && (
                <div className="space-y-2">
                  {ACTIVITY.map((ev, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-md" style={{ background: '#16213e' }}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.pts > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <div className="flex-1">
                        <p className="text-[#e2e8f0] text-[12px]">{ev.label}</p>
                        <p className="text-[#94a3b8] text-[11px]">{ev.date}</p>
                      </div>
                      <p className={`text-[13px] font-semibold tabular-nums ${ACTIVITY_COLOR[ev.type]}`}>{ev.pts > 0 ? '+' : ''}{ev.pts} pts</p>
                    </div>
                  ))}
                </div>
              )}
              {drawerTab === 'redemptions' && (
                <div className="space-y-2">
                  {REDEMPTIONS.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-md" style={{ background: '#16213e' }}>
                      <div>
                        <p className="text-[#e2e8f0] text-[12px]">{r.date}</p>
                        <p className="text-[#94a3b8] text-[11px] font-mono">{r.transaction}</p>
                      </div>
                      <p className="text-amber-400 font-semibold tabular-nums">${r.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
              {drawerTab === 'transactions' && (
                <div className="space-y-2">
                  {TRANSACTIONS.map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-md" style={{ background: '#16213e' }}>
                      <div>
                        <p className="text-[#e2e8f0] text-[12px]">{t.desc}</p>
                        <p className="text-[#94a3b8] text-[11px]">{t.date}</p>
                      </div>
                      <p className="text-emerald-400 font-semibold tabular-nums">${t.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
              {drawerTab === 'notes' && (
                <div>
                  <p className="text-[11px] text-[#94a3b8] mb-2">CS Notes for {drawer.name}</p>
                  <textarea className="w-full h-48 px-3 py-2 rounded-md text-[12px] bg-[#16213e] border border-[rgba(99,102,241,0.3)] text-[#e2e8f0] placeholder-[#94a3b8] outline-none focus:border-indigo-500 resize-none" placeholder="Add customer service notes..." value={notes} onChange={e => setNotes(e.target.value)} />
                  <button className="mt-2 px-3 py-1.5 rounded-md text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">Save Notes</button>
                </div>
              )}
            </div>

            <div className="px-6 py-4 flex gap-2" style={{ borderTop: '1px solid rgba(99,102,241,0.15)' }}>
              <button className="flex-1 px-3 py-2 rounded-md text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors" onClick={() => { setIssueModal(true); setDrawer(null) }}>Issue Points</button>
              <button className="flex-1 px-3 py-2 rounded-md text-[12px] font-medium bg-[#16213e] hover:bg-[#1e2d4a] text-[#e2e8f0] border border-[rgba(99,102,241,0.3)] transition-colors">Edit Member</button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Points Modal */}
      {issueModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setIssueModal(false)}>
          <div className="w-[400px] rounded-lg p-6 space-y-4" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.3)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-[#e2e8f0] font-semibold text-[14px]">Issue Points</h3>
              <button onClick={() => setIssueModal(false)} className="text-[#94a3b8] hover:text-[#e2e8f0] text-xl leading-none">x</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#94a3b8] mb-1">Member</label>
                <input className="w-full px-3 py-2 rounded-md text-[12px] bg-[#0d0e24] border border-[rgba(99,102,241,0.3)] text-[#e2e8f0] outline-none focus:border-indigo-500" placeholder="Search member..." defaultValue={drawer?.name ?? ''} />
              </div>
              <div>
                <label className="block text-[11px] text-[#94a3b8] mb-1">Points</label>
                <input type="number" className="w-full px-3 py-2 rounded-md text-[12px] bg-[#0d0e24] border border-[rgba(99,102,241,0.3)] text-[#e2e8f0] outline-none focus:border-indigo-500" placeholder="0" value={issuePoints} onChange={e => setIssuePoints(e.target.value)} />
              </div>
              <div>
                <label className="block text-[11px] text-[#94a3b8] mb-1">Reason</label>
                <select className="w-full px-3 py-2 rounded-md text-[12px] bg-[#0d0e24] border border-[rgba(99,102,241,0.3)] text-[#e2e8f0] outline-none focus:border-indigo-500" value={issueReason} onChange={e => setIssueReason(e.target.value)}>
                  {['Customer Goodwill', 'Correction', 'Promotion', 'Contest', 'Other'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#94a3b8] mb-1">Notes</label>
                <textarea className="w-full px-3 py-2 rounded-md text-[12px] bg-[#0d0e24] border border-[rgba(99,102,241,0.3)] text-[#e2e8f0] outline-none focus:border-indigo-500 resize-none h-20" placeholder="Optional notes..." value={issueNotes} onChange={e => setIssueNotes(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button className="flex-1 px-3 py-2 rounded-md text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors" onClick={() => setIssueModal(false)}>Issue Points</button>
              <button className="px-3 py-2 rounded-md text-[12px] font-medium bg-[#0d0e24] hover:bg-[rgba(99,102,241,0.1)] text-[#e2e8f0] border border-[rgba(99,102,241,0.3)] transition-colors" onClick={() => setIssueModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
