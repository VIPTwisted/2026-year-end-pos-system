'use client'
import { useEffect, useState, useCallback } from 'react'
import {
  Send, Plus, Copy, PlayCircle, XCircle, BarChart2, Search,
  ChevronRight, ChevronDown, ChevronUp, X, Calendar, User,
  TrendingUp, Users, Target, Activity, SlidersHorizontal, Check
} from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────
type CampaignStatus = 'Active' | 'Completed' | 'Planned' | 'Inactive'

interface Campaign {
  id: string
  campaignNo: string
  description: string
  status: CampaignStatus
  campaignType: string
  startDate: string
  endDate: string
  salesperson: string
  noOfContacts: number
  responseRate: number
  budget: number
  spent: number
}

interface NewCampaignForm {
  description: string
  status: CampaignStatus
  campaignType: string
  startDate: string
  endDate: string
  salesperson: string
  budget: string
}

type SortKey = keyof Pick<Campaign, 'campaignNo' | 'description' | 'status' | 'startDate' | 'endDate' | 'salesperson' | 'noOfContacts' | 'responseRate'>
type SortDir = 'asc' | 'desc'

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1',  campaignNo: 'CAMP-0001', description: 'Spring Promo 2026',          status: 'Active',    campaignType: 'Email',        startDate: '2026-03-01', endDate: '2026-05-31', salesperson: 'J. Rivera',    noOfContacts: 480, responseRate: 11.2, budget: 5000,  spent: 2840 },
  { id: '2',  campaignNo: 'CAMP-0002', description: 'VIP Loyalty Outreach',       status: 'Active',    campaignType: 'Multi-Channel',startDate: '2026-01-15', endDate: '2026-06-30', salesperson: 'A. Chen',      noOfContacts: 320, responseRate: 14.7, budget: 8000,  spent: 4120 },
  { id: '3',  campaignNo: 'CAMP-0003', description: 'Q1 Wholesale Push',          status: 'Completed', campaignType: 'Phone',        startDate: '2026-01-01', endDate: '2026-03-31', salesperson: 'M. Johnson',   noOfContacts: 210, responseRate: 9.4,  budget: 3500,  spent: 3500 },
  { id: '4',  campaignNo: 'CAMP-0004', description: 'New Product Launch',         status: 'Planned',   campaignType: 'Email',        startDate: '2026-05-01', endDate: '2026-07-31', salesperson: 'K. Williams',  noOfContacts: 0,   responseRate: 0,    budget: 12000, spent: 0    },
  { id: '5',  campaignNo: 'CAMP-0005', description: 'Retail Partner Engagement',  status: 'Active',    campaignType: 'Event',        startDate: '2026-02-10', endDate: '2026-08-10', salesperson: 'J. Rivera',    noOfContacts: 560, responseRate: 7.8,  budget: 15000, spent: 6200 },
  { id: '6',  campaignNo: 'CAMP-0006', description: 'Summer Clearance Sale',      status: 'Planned',   campaignType: 'Email',        startDate: '2026-06-01', endDate: '2026-08-31', salesperson: 'A. Chen',      noOfContacts: 0,   responseRate: 0,    budget: 4500,  spent: 0    },
  { id: '7',  campaignNo: 'CAMP-0007', description: 'Customer Win-Back 2026',     status: 'Active',    campaignType: 'Multi-Channel',startDate: '2026-03-15', endDate: '2026-06-15', salesperson: 'M. Johnson',   noOfContacts: 290, responseRate: 5.2,  budget: 6000,  spent: 3100 },
  { id: '8',  campaignNo: 'CAMP-0008', description: 'Holiday Preview Campaign',   status: 'Planned',   campaignType: 'Email',        startDate: '2026-10-01', endDate: '2026-12-31', salesperson: 'K. Williams',  noOfContacts: 0,   responseRate: 0,    budget: 20000, spent: 0    },
  { id: '9',  campaignNo: 'CAMP-0009', description: 'B2B Referral Drive',         status: 'Inactive',  campaignType: 'Phone',        startDate: '2025-09-01', endDate: '2025-12-31', salesperson: 'J. Rivera',    noOfContacts: 145, responseRate: 3.4,  budget: 2000,  spent: 1800 },
  { id: '10', campaignNo: 'CAMP-0010', description: 'Trade Show Follow-Up',       status: 'Completed', campaignType: 'Email',        startDate: '2026-01-20', endDate: '2026-02-28', salesperson: 'A. Chen',      noOfContacts: 380, responseRate: 18.9, budget: 1500,  spent: 1500 },
  { id: '11', campaignNo: 'CAMP-0011', description: 'Membership Drive Q2',        status: 'Active',    campaignType: 'Event',        startDate: '2026-04-01', endDate: '2026-06-30', salesperson: 'M. Johnson',   noOfContacts: 210, responseRate: 6.1,  budget: 7500,  spent: 2900 },
  { id: '12', campaignNo: 'CAMP-0012', description: 'Social Media Boost',         status: 'Inactive',  campaignType: 'Digital',      startDate: '2025-11-01', endDate: '2026-01-31', salesperson: 'K. Williams',  noOfContacts: 920, responseRate: 2.1,  budget: 3000,  spent: 3000 },
  { id: '13', campaignNo: 'CAMP-0013', description: 'Newsletter Relaunch',        status: 'Completed', campaignType: 'Email',        startDate: '2026-02-01', endDate: '2026-03-31', salesperson: 'J. Rivera',    noOfContacts: 1240,responseRate: 12.5, budget: 800,   spent: 800  },
  { id: '14', campaignNo: 'CAMP-0014', description: 'Distributor Incentive',      status: 'Planned',   campaignType: 'Phone',        startDate: '2026-07-01', endDate: '2026-09-30', salesperson: 'A. Chen',      noOfContacts: 0,   responseRate: 0,    budget: 9000,  spent: 0    },
  { id: '15', campaignNo: 'CAMP-0015', description: 'End-of-Year Blowout',        status: 'Completed', campaignType: 'Multi-Channel',startDate: '2025-11-15', endDate: '2025-12-31', salesperson: 'M. Johnson',   noOfContacts: 2800,responseRate: 8.7,  budget: 18000, spent: 18000},
  { id: '16', campaignNo: 'CAMP-0016', description: 'Premium Account Upsell',     status: 'Active',    campaignType: 'Phone',        startDate: '2026-04-10', endDate: '2026-07-10', salesperson: 'K. Williams',  noOfContacts: 88,  responseRate: 22.7, budget: 4000,  spent: 1200 },
  { id: '17', campaignNo: 'CAMP-0017', description: 'Back-to-School Supplies',    status: 'Planned',   campaignType: 'Email',        startDate: '2026-07-15', endDate: '2026-09-15', salesperson: 'J. Rivera',    noOfContacts: 0,   responseRate: 0,    budget: 5500,  spent: 0    },
  { id: '18', campaignNo: 'CAMP-0018', description: 'Reorder Reminder Blast',     status: 'Active',    campaignType: 'Email',        startDate: '2026-03-20', endDate: '2026-06-20', salesperson: 'A. Chen',      noOfContacts: 410, responseRate: 9.8,  budget: 1200,  spent: 740  },
  { id: '19', campaignNo: 'CAMP-0019', description: 'Influencer Collaboration',   status: 'Inactive',  campaignType: 'Digital',      startDate: '2025-10-01', endDate: '2026-01-01', salesperson: 'M. Johnson',   noOfContacts: 330, responseRate: 4.5,  budget: 6500,  spent: 6500 },
  { id: '20', campaignNo: 'CAMP-0020', description: 'Partner Portal Launch',      status: 'Completed', campaignType: 'Event',        startDate: '2026-02-14', endDate: '2026-04-14', salesperson: 'K. Williams',  noOfContacts: 165, responseRate: 16.4, budget: 11000, spent: 10800},
]

const SALESPERSONS = ['J. Rivera', 'A. Chen', 'M. Johnson', 'K. Williams']
const CAMPAIGN_TYPES = ['Email', 'Phone', 'Event', 'Multi-Channel', 'Digital']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusChip(status: CampaignStatus) {
  const map: Record<CampaignStatus, string> = {
    Active:    'bg-green-500/20 text-green-400 border border-green-500/30',
    Completed: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    Planned:   'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    Inactive:  'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30',
  }
  return map[status] ?? map.Inactive
}

function fmtDate(d: string) {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

// ─── SVG Charts ───────────────────────────────────────────────────────────────
function ResponseRateChart({ campaign }: { campaign: Campaign }) {
  // Simulated 6-month trend based on campaign data
  const seed = campaign.responseRate
  const points = [
    seed * 0.3, seed * 0.55, seed * 0.7, seed * 0.85, seed * 0.95, seed
  ]
  const max = Math.max(...points, 1)
  const w = 320, h = 80, pad = 8
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (w - pad * 2))
  const ys = points.map(v => h - pad - ((v / max) * (h - pad * 2)))
  const polyline = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
  const area = `${xs[0]},${h - pad} ` + xs.map((x, i) => `${x},${ys[i]}`).join(' ') + ` ${xs[xs.length - 1]},${h - pad}`

  return (
    <div>
      <p className="text-[11px] text-zinc-500 mb-2 uppercase tracking-wide">Response Rate Trend</p>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <linearGradient id="rr-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#rr-grad)" />
        <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r="2.5" fill="#6366f1" />
        ))}
        {['Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => (
          <text key={m} x={xs[i]} y={h - 1} textAnchor="middle" fontSize="8" fill="#71717a">{m}</text>
        ))}
      </svg>
    </div>
  )
}

function ContactsBySegmentChart({ campaign }: { campaign: Campaign }) {
  const segments = ['Retail', 'Wholesale', 'VIP', 'New', 'Lapsed']
  const total = campaign.noOfContacts || 100
  const raw = [0.32, 0.24, 0.18, 0.15, 0.11]
  const vals = raw.map(r => Math.round(r * total))
  const maxVal = Math.max(...vals, 1)
  const barColors = ['#6366f1', '#22d3ee', '#a78bfa', '#34d399', '#f59e0b']

  return (
    <div>
      <p className="text-[11px] text-zinc-500 mb-2 uppercase tracking-wide">Contacts by Segment</p>
      <svg width="320" height="90" viewBox="0 0 320 90" className="w-full">
        {segments.map((seg, i) => {
          const barW = ((vals[i] / maxVal) * 240)
          const y = i * 17
          return (
            <g key={seg}>
              <text x="0" y={y + 10} fontSize="8" fill="#a1a1aa">{seg}</text>
              <rect x="50" y={y + 2} width={barW} height="10" rx="2" fill={barColors[i]} opacity="0.8" />
              <text x={50 + barW + 4} y={y + 10} fontSize="8" fill="#e4e4e7">{vals[i]}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
type DrawerTab = 'General' | 'Contacts' | 'Activities' | 'Statistics'

function CampaignDrawer({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('General')
  const tabs: DrawerTab[] = ['General', 'Contacts', 'Activities', 'Statistics']

  const budgetPct = campaign.budget > 0 ? Math.min(100, Math.round((campaign.spent / campaign.budget) * 100)) : 0

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div
        className="w-[480px] h-full flex flex-col shadow-2xl border-l border-zinc-800/70"
        style={{ background: '#16213e' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-zinc-800/60">
          <div>
            <p className="text-[11px] text-zinc-500 font-mono mb-0.5">{campaign.campaignNo}</p>
            <h2 className="text-base font-semibold text-white leading-tight">{campaign.description}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusChip(campaign.status)}`}>{campaign.status}</span>
              <span className="text-[11px] text-zinc-500">{campaign.campaignType}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FastTabs */}
        <div className="flex border-b border-zinc-800/60 px-5">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeTab === t
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {activeTab === 'General' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FieldBlock label="Campaign No." value={campaign.campaignNo} mono />
                <FieldBlock label="Status" value={campaign.status} />
                <FieldBlock label="Campaign Type" value={campaign.campaignType} />
                <FieldBlock label="Salesperson" value={campaign.salesperson} />
                <FieldBlock label="Start Date" value={fmtDate(campaign.startDate)} />
                <FieldBlock label="End Date" value={fmtDate(campaign.endDate)} />
              </div>
              <div className="rounded-lg border border-zinc-700/50 p-4" style={{ background: '#0f0f1a' }}>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-3">Budget Overview</p>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-zinc-400">Total Budget</span>
                  <span className="text-xs text-white font-medium">{fmtCurrency(campaign.budget)}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-xs text-zinc-400">Spent</span>
                  <span className="text-xs text-amber-400 font-medium">{fmtCurrency(campaign.spent)}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 text-right">{budgetPct}% utilized</p>
              </div>
            </>
          )}

          {activeTab === 'Contacts' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-zinc-300">Contacts in Campaign</p>
                <span className="text-xs text-indigo-400 font-mono">{campaign.noOfContacts.toLocaleString()}</span>
              </div>
              {['Retail Partners', 'Wholesale Accounts', 'VIP Members', 'New Leads', 'Lapsed Customers'].map((grp, i) => {
                const pcts = [0.32, 0.24, 0.18, 0.15, 0.11]
                const cnt = Math.round(pcts[i] * campaign.noOfContacts)
                return (
                  <div key={grp} className="flex items-center justify-between py-2.5 border-b border-zinc-800/50">
                    <span className="text-xs text-zinc-300">{grp}</span>
                    <span className="text-xs text-zinc-400 font-mono">{cnt.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'Activities' && (
            <div className="space-y-3">
              {[
                { date: '2026-04-18', type: 'Email Sent', note: 'Initial campaign email dispatched', user: campaign.salesperson },
                { date: '2026-04-10', type: 'List Updated', note: 'Contact list refreshed from segment filters', user: 'System' },
                { date: '2026-04-05', type: 'Campaign Created', note: 'Campaign record created in NovaPOS', user: campaign.salesperson },
                { date: '2026-03-28', type: 'Budget Approved', note: `Budget of ${fmtCurrency(campaign.budget)} approved`, user: 'Manager' },
              ].map((a, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />
                    {i < 3 && <div className="w-px flex-1 bg-zinc-700/50 mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-zinc-300 font-medium">{a.type}</p>
                    <p className="text-zinc-500 mt-0.5">{a.note}</p>
                    <p className="text-zinc-600 mt-1">{fmtDate(a.date)} · {a.user}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Statistics' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'No. of Contacts', value: campaign.noOfContacts.toLocaleString(), icon: <Users className="w-4 h-4 text-indigo-400" /> },
                  { label: 'Response Rate', value: `${campaign.responseRate}%`, icon: <TrendingUp className="w-4 h-4 text-green-400" /> },
                  { label: 'Budget Spent', value: fmtCurrency(campaign.spent), icon: <Target className="w-4 h-4 text-amber-400" /> },
                  { label: 'Responses', value: Math.round(campaign.noOfContacts * campaign.responseRate / 100).toLocaleString(), icon: <Activity className="w-4 h-4 text-cyan-400" /> },
                ].map(s => (
                  <div key={s.label} className="rounded-lg border border-zinc-700/50 p-3" style={{ background: '#0f0f1a' }}>
                    <div className="flex items-center gap-2 mb-1">{s.icon}<p className="text-[10px] text-zinc-500 uppercase tracking-wide">{s.label}</p></div>
                    <p className="text-base font-semibold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
              <ResponseRateChart campaign={campaign} />
              <ContactsBySegmentChart campaign={campaign} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldBlock({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-xs text-zinc-200 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  )
}

// ─── New Campaign Modal ────────────────────────────────────────────────────────
function NewCampaignModal({ onClose, onSave }: { onClose: () => void; onSave: (f: NewCampaignForm) => void }) {
  const [form, setForm] = useState<NewCampaignForm>({
    description: '', status: 'Planned', campaignType: 'Email',
    startDate: '', endDate: '', salesperson: '', budget: ''
  })
  const set = (k: keyof NewCampaignForm, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-[520px] rounded-xl border border-zinc-700/60 shadow-2xl"
        style={{ background: '#16213e' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
          <h3 className="text-sm font-semibold text-white">New Campaign</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Description *</label>
            <input
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              placeholder="Campaign description"
            />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value as CampaignStatus)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
              {(['Planned','Active','Inactive','Completed'] as CampaignStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Campaign Type</label>
            <select value={form.campaignType} onChange={e => set('campaignType', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
              {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Start Date</label>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">End Date</label>
            <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Salesperson</label>
            <select value={form.salesperson} onChange={e => set('salesperson', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
              <option value="">— Select —</option>
              {SALESPERSONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Budget (USD)</label>
            <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="0"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-zinc-800/60">
          <button onClick={onClose} className="px-4 py-2 text-xs text-zinc-400 hover:text-white border border-zinc-700 rounded hover:bg-zinc-700/50 transition-colors">Cancel</button>
          <button
            onClick={() => { if (form.description) { onSave(form); onClose() } }}
            className="px-4 py-2 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Create Campaign
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CampaignsClient() {
  const [rows, setRows] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('')
  const [salespersonFilter, setSalespersonFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('campaignNo')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (statusFilter) q.set('statusCode', statusFilter)
    fetch(`/api/crm/campaigns?${q}`)
      .then(r => r.json())
      .then(d => { setRows(Array.isArray(d) && d.length ? d : MOCK_CAMPAIGNS); setLoading(false) })
      .catch(() => { setRows(MOCK_CAMPAIGNS); setLoading(false) })
  }, [search, statusFilter])

  useEffect(() => { load() }, [load])

  // KPIs
  const totalCampaigns = rows.length
  const activeCampaigns = rows.filter(r => r.status === 'Active').length
  const avgResponseRate = rows.filter(r => r.responseRate > 0).length > 0
    ? (rows.filter(r => r.responseRate > 0).reduce((a, b) => a + b.responseRate, 0) / rows.filter(r => r.responseRate > 0).length).toFixed(1)
    : '0.0'
  const totalContacts = rows.reduce((a, b) => a + b.noOfContacts, 0)

  // Filter + sort
  const filtered = rows
    .filter(r => {
      const term = search.toLowerCase()
      const matchSearch = !term || r.description.toLowerCase().includes(term) || r.campaignNo.toLowerCase().includes(term)
      const matchStatus = !statusFilter || r.status === statusFilter
      const matchSalesperson = !salespersonFilter || r.salesperson === salespersonFilter
      return matchSearch && matchStatus && matchSalesperson
    })
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 text-zinc-600 inline ml-0.5" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-indigo-400 inline ml-0.5" />
      : <ChevronDown className="w-3 h-3 text-indigo-400 inline ml-0.5" />
  }

  const handleSaveCampaign = (form: NewCampaignForm) => {
    const next: Campaign = {
      id: String(Date.now()),
      campaignNo: `CAMP-${String(rows.length + 1).padStart(4, '0')}`,
      description: form.description,
      status: form.status,
      campaignType: form.campaignType,
      startDate: form.startDate,
      endDate: form.endDate,
      salesperson: form.salesperson,
      noOfContacts: 0,
      responseRate: 0,
      budget: Number(form.budget) || 0,
      spent: 0,
    }
    setRows(r => [next, ...r])
  }

  const ribbonActions = [
    { label: 'New',            icon: <Plus className="w-3.5 h-3.5" />,       onClick: () => setShowNewModal(true) },
    { label: 'Copy Campaign',  icon: <Copy className="w-3.5 h-3.5" />,       onClick: () => {} },
    { label: 'Activate',       icon: <PlayCircle className="w-3.5 h-3.5" />, onClick: () => {} },
    { label: 'Close',          icon: <XCircle className="w-3.5 h-3.5" />,    onClick: () => {} },
    { label: 'Statistics',     icon: <BarChart2 className="w-3.5 h-3.5" />,  onClick: () => {} },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh]" style={{ background: '#0f0f1a', color: '#e2e8f0' }}>
      <TopBar
        title="Campaigns"
        breadcrumb={[{ label: 'CRM', href: '/crm' }]}
        actions={
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Campaign
          </button>
        }
      />

      {/* D365 Action Ribbon */}
      <div className="flex items-center gap-1 px-4 py-1.5 border-b border-zinc-800/50" style={{ background: '#13132a' }}>
        {ribbonActions.map(a => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded transition-colors"
          >
            {a.icon}
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-zinc-800/50">
        {[
          { label: 'Total Campaigns',    value: totalCampaigns.toString(),       icon: <Send className="w-4 h-4 text-indigo-400" />,   color: 'text-white' },
          { label: 'Active',             value: activeCampaigns.toString(),       icon: <Activity className="w-4 h-4 text-green-400" />, color: 'text-green-400' },
          { label: 'Avg Response Rate',  value: `${avgResponseRate}%`,            icon: <TrendingUp className="w-4 h-4 text-cyan-400" />,color: 'text-cyan-400' },
          { label: 'Total Contacts',     value: totalContacts.toLocaleString(),   icon: <Users className="w-4 h-4 text-amber-400" />,   color: 'text-amber-400' },
        ].map(k => (
          <div key={k.label} className="rounded-lg border border-zinc-800/50 px-4 py-3 flex items-center gap-3" style={{ background: '#16213e' }}>
            <div className="p-2 rounded-lg bg-zinc-800/50">{k.icon}</div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{k.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${k.color}`}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Strip */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-800/50 flex-wrap" style={{ background: '#0f0f1a' }}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-56 bg-zinc-900 border border-zinc-700/50 rounded px-3 py-1.5 pl-8 text-xs placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            style={{ color: '#e2e8f0' }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as CampaignStatus | '')}
            className="bg-zinc-900 border border-zinc-700/50 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            style={{ color: '#e2e8f0' }}
          >
            <option value="">All Statuses</option>
            {(['Active','Inactive','Completed','Planned'] as CampaignStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={salespersonFilter}
            onChange={e => setSalespersonFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-700/50 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            style={{ color: '#e2e8f0' }}
          >
            <option value="">All Salespersons</option>
            {SALESPERSONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <span className="ml-auto text-[11px] text-zinc-500">{filtered.length} of {rows.length} records</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 border-b border-zinc-800/60 z-10" style={{ background: '#13132a' }}>
            <tr className="text-zinc-500 text-[10px] uppercase tracking-wider">
              {([
                ['campaignNo',   'Campaign No.',      'left',  'w-32'],
                ['description',  'Description',       'left',  ''],
                ['status',       'Status',            'left',  'w-28'],
                ['startDate',    'Start Date',        'left',  'w-28'],
                ['endDate',      'End Date',          'left',  'w-28'],
                ['salesperson',  'Salesperson',       'left',  'w-32'],
                ['noOfContacts', 'No. of Contacts',   'right', 'w-32'],
                ['responseRate', 'Response Rate',     'left',  'w-44'],
              ] as [SortKey, string, string, string][]).map(([key, label, align, cls]) => (
                <th
                  key={key}
                  className={`px-4 py-2.5 text-${align} ${cls} cursor-pointer hover:text-zinc-300 select-none`}
                  onClick={() => toggleSort(key)}
                >
                  {label} <SortIcon col={key} />
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {loading && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-zinc-500 text-xs">Loading campaigns…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-zinc-500 text-xs">No campaigns match your filters</td></tr>
            )}
            {!loading && filtered.map(row => (
              <tr
                key={row.id}
                onClick={() => setSelectedCampaign(row)}
                className="cursor-pointer transition-colors hover:bg-zinc-800/30"
              >
                <td className="px-4 py-2.5 font-mono text-indigo-400 text-[11px]">{row.campaignNo}</td>
                <td className="px-4 py-2.5 font-medium" style={{ color: '#e2e8f0' }}>{row.description}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusChip(row.status)}`}>{row.status}</span>
                </td>
                <td className="px-4 py-2.5 text-zinc-400 text-[11px]">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-zinc-600" />{fmtDate(row.startDate)}</span>
                </td>
                <td className="px-4 py-2.5 text-zinc-400 text-[11px]">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-zinc-600" />{fmtDate(row.endDate)}</span>
                </td>
                <td className="px-4 py-2.5 text-zinc-400">{row.salesperson}</td>
                <td className="px-4 py-2.5 text-right font-mono" style={{ color: '#e2e8f0' }}>{row.noOfContacts.toLocaleString()}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-800 rounded-full h-1.5 w-24">
                      <div
                        className="h-1.5 rounded-full bg-indigo-500"
                        style={{ width: `${Math.min(100, row.responseRate * 4)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-zinc-300 w-10 text-right">{row.responseRate}%</span>
                  </div>
                </td>
                <td className="px-3 py-2.5"><ChevronRight className="w-3.5 h-3.5 text-zinc-600" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {selectedCampaign && (
        <CampaignDrawer campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}

      {/* New Campaign Modal */}
      {showNewModal && (
        <NewCampaignModal onClose={() => setShowNewModal(false)} onSave={handleSaveCampaign} />
      )}
    </div>
  )
}
