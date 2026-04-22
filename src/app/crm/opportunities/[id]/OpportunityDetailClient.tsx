'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Target, ChevronRight, Pencil, Save, X, CheckCircle,
  ArrowLeft, RefreshCw, Mail, Share2, Bell, FileText,
  ChevronDown, Zap
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface BCOpportunity {
  id: string; opportunityNo: string; description: string
  contactId: string | null; contactName: string | null
  salesperson: string | null; status: string; stage: string | null
  probability: number; estimatedValue: number; closeDate: string | null
  campaignId: string | null; createdAt: string
}

interface AnalyticsData {
  health: { score: string; trend: string; nextActivity: null | string; lastInteractionDate: string; lastInteractionNote: string }
  interactions: { period: string; fromUs: number; fromThem: number }[]
  timeSpent: { usHours: number; themHours: number }
  emailEngagement: { opened: number; attachmentsViewed: number; linksClicked: number }
  responseRate: { byUs: number; byThem: number }
  responseTime: { ourHours: number; theirHours: number }
  mostContacted: { name: string; initials: string; color: string; emails: number; meetings: number; calls: number }[]
  mostContactedBy: { name: string; initials: string; color: string; emails: number; meetings: number; calls: number }[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STAGES = ['Initial Contact', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
const STATUS_COLOR: Record<string, string> = {
  Open: 'bg-yellow-500/20 text-yellow-400',
  Won: 'bg-green-500/20 text-green-400',
  Lost: 'bg-red-500/20 text-red-400',
}

type Tab = 'Summary' | 'Relationship Analytics' | 'Product line items' | 'Quotes' | 'Related'
const TABS: Tab[] = ['Summary', 'Relationship Analytics', 'Product line items', 'Quotes', 'Related']

// ─── SVG Components ──────────────────────────────────────────────────────────

function DonutChart({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r = size * 0.35
  const c = size / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={size * 0.12} />
      <circle
        cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={size * 0.12}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
      />
      <text x={c} y={c} textAnchor="middle" dy="0.35em" fontSize={size * 0.22} fill="white" fontWeight="600">{pct}%</text>
    </svg>
  )
}

function TimeSpentDonut({ us, them }: { us: number; them: number }) {
  const total = us + them
  const size = 120
  const c = size / 2
  const r = size * 0.32
  const circ = 2 * Math.PI * r
  const usDash = (us / total) * circ
  const themDash = (them / total) * circ
  const usOffset = 0
  const themOffset = usDash
  return (
    <svg width={size} height={size}>
      {/* background ring */}
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * 0.14} />
      {/* us arc - teal */}
      <circle
        cx={c} cy={c} r={r} fill="none" stroke="#0097b2" strokeWidth={size * 0.14}
        strokeDasharray={`${usDash} ${circ - usDash}`} strokeLinecap="butt"
        strokeDashoffset={-usOffset} transform={`rotate(-90 ${c} ${c})`}
      />
      {/* them arc - orange */}
      <circle
        cx={c} cy={c} r={r} fill="none" stroke="#f97316" strokeWidth={size * 0.14}
        strokeDasharray={`${themDash} ${circ - themDash}`} strokeLinecap="butt"
        strokeDashoffset={-themOffset} transform={`rotate(-90 ${c} ${c})`}
      />
    </svg>
  )
}

function BarChart({ data }: { data: { period: string; fromUs: number; fromThem: number }[] }) {
  const max = Math.max(...data.flatMap(d => [d.fromUs, d.fromThem]))
  const h = 120
  const barW = 14
  const groupW = barW * 2 + 6 + 16
  const w = data.length * groupW + 20
  return (
    <svg width={w} height={h + 24}>
      {data.map((d, i) => {
        const x = i * groupW + 10
        const usH = max > 0 ? (d.fromUs / max) * h : 0
        const themH = max > 0 ? (d.fromThem / max) * h : 0
        return (
          <g key={i}>
            <rect x={x} y={h - usH} width={barW} height={usH} fill="#0097b2" rx={2} />
            <rect x={x + barW + 4} y={h - themH} width={barW} height={themH} fill="#f97316" rx={2} />
            <text x={x + barW + 2} y={h + 14} textAnchor="middle" fontSize={9} fill="#71717a">{d.period}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Relationship Analytics Tab ──────────────────────────────────────────────

function RelationshipAnalyticsTab({ id }: { id: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/crm/opportunities/${id}/analytics`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-6 text-zinc-500 text-sm animate-pulse">Loading analytics...</div>
  if (!data) return <div className="p-6 text-zinc-500 text-sm">No analytics data available.</div>

  const totalTime = data.timeSpent.usHours + data.timeSpent.themHours

  return (
    <div className="space-y-4 py-4">

      {/* Row 1: Health | Bar Chart | Time Spent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Relationship Health */}
        <div className="bg-[#111329] border border-indigo-500/20 rounded-lg p-5">
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest mb-3 font-semibold">Relationship Health</p>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
            <span className="text-sm text-white font-medium">{data.health.score} relationship and {data.health.trend}</span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Next Interaction</p>
              <div className="flex items-center gap-2 text-sm text-red-400">
                <X className="w-3.5 h-3.5 shrink-0" />
                <span>Next Activity Not Scheduled</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Last Interaction</p>
              <div className="flex items-start gap-2 text-sm text-zinc-300">
                <ArrowLeft className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-400" />
                <span>
                  {new Date(data.health.lastInteractionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' · '}{data.health.lastInteractionNote}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* All Interactions Bar Chart */}
        <div className="bg-[#111329] border border-indigo-500/20 rounded-lg p-5">
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest mb-3 font-semibold">All Interactions</p>
          <div className="overflow-x-auto">
            <BarChart data={data.interactions} />
          </div>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#0097b2]" /><span>From us</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#f97316]" /><span>From them</span>
            </div>
          </div>
        </div>

        {/* Time Spent Donut */}
        <div className="bg-[#111329] border border-indigo-500/20 rounded-lg p-5">
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest mb-3 font-semibold">Time Spent</p>
          <div className="flex items-center gap-4">
            <div className="relative">
              <TimeSpentDonut us={data.timeSpent.usHours} them={data.timeSpent.themHours} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-zinc-400">{totalTime.toFixed(1)}h</span>
                <span className="text-[8px] text-zinc-600">total</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                <span className="text-sm text-zinc-300">Them <span className="text-white font-semibold">{data.timeSpent.themHours}h</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0097b2]" />
                <span className="text-sm text-zinc-300">Us <span className="text-white font-semibold">{data.timeSpent.usHours}h</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Email Engagement | Response Rate | Response Time */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Email Engagement */}
        <div className="bg-[#111329] border border-indigo-500/20 rounded-lg p-5">
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest mb-4 font-semibold">Email Engagement</p>
          <div className="flex items-start justify-around gap-2">
            <div className="flex flex-col items-center gap-2">
              <DonutChart pct={data.emailEngagement.opened} color="#0097b2" size={72} />
              <p className="text-[10px] text-zinc-400 text-center leading-tight">Emails<br />Opened</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DonutChart pct={data.emailEngagement.attachmentsViewed} color="#f97316" size={72} />
              <p className="text-[10px] text-zinc-400 text-center leading-tight">Attachments<br />Viewed</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DonutChart pct={data.emailEngagement.linksClicked} color="#0097b2" size={72} />
              <p className="text-[10px] text-zinc-400 text-center leading-tight">Links<br />Clicked</p>
            </div>
          </div>
        </div>

        {/* Response Rate */}
        <div className="bg-[#111329] border border-indigo-500/20 rounded-lg p-5">
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest mb-4 font-semibold">Response Rate</p>
          <div className="flex items-start justify-around gap-2">
            <div className="flex flex-col items-center gap-2">
              <DonutChart pct={data.responseRate.byUs} color="#6366f1" size={72} />
              <p className="text-[10px] text-zinc-400 text-center leading-tight">By Us</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DonutChart pct={data.responseRate.byThem} color="#f97316" size={72} />
              <p className="text-[10px] text-zinc-400 text-center leading-tight">By Them</p>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-[#111329] border border-indigo-500/20 rounded-lg p-5">
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest mb-4 font-semibold">Response Time</p>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-zinc-500 mb-0.5">Your Response Time</p>
              <p className="text-3xl font-bold text-[#0097b2] leading-none">{data.responseTime.ourHours}<span className="text-lg font-normal text-zinc-400 ml-1">h</span></p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 mb-0.5">Their Response Time</p>
              <p className="text-3xl font-bold text-[#f97316] leading-none">{data.responseTime.theirHours}<span className="text-lg font-normal text-zinc-400 ml-1">h</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Most Contacted | Most Contacted By */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Most Contacted */}
        <div className="bg-[#111329] border border-indigo-500/20 rounded-lg p-5">
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest mb-4 font-semibold">Most Contacted</p>
          {data.mostContacted.map(person => (
            <ContactRow key={person.name} person={person} />
          ))}
        </div>

        {/* Most Contacted By */}
        <div className="bg-[#111329] border border-indigo-500/20 rounded-lg p-5">
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest mb-4 font-semibold">Most Contacted By</p>
          {data.mostContactedBy.map(person => (
            <ContactRow key={person.name} person={person} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ContactRow({ person }: { person: { name: string; initials: string; color: string; emails: number; meetings: number; calls: number } }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ backgroundColor: person.color + '33', border: `1.5px solid ${person.color}66`, color: person.color }}
      >
        {person.initials}
      </div>
      <div className="flex-1">
        <p className="text-sm text-white font-medium">{person.name}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-[10px] text-zinc-400">
            <Mail className="w-3 h-3 text-[#0097b2]" />{person.emails}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-zinc-400">
            <svg className="w-3 h-3 text-[#f97316]" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v7A1.5 1.5 0 0112.5 12H9l-3 3v-3H3.5A1.5 1.5 0 012 10.5v-7z"/></svg>
            {person.meetings}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-zinc-400">
            <svg className="w-3 h-3 text-[#6366f1]" viewBox="0 0 16 16" fill="currentColor"><path d="M3.654 1.328a.678.678 0 00-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 004.168 6.608 17.6 17.6 0 006.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 00-.063-1.015l-2.307-1.794a.68.68 0 00-.58-.122l-2.19.547a1.745 1.745 0 01-1.657-.459L5.482 8.062a1.745 1.745 0 01-.46-1.657l.548-2.19a.68.68 0 00-.122-.58L3.654 1.328z"/></svg>
            {person.calls}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OpportunityDetailClient({ id }: { id: string }) {
  const [opp, setOpp] = useState<BCOpportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    description: '', salesperson: '', status: '', stage: '',
    probability: '', estimatedValue: '', closeDate: ''
  })
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<Tab>('Relationship Analytics')

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/crm/opportunities/${id}`)
      .then(r => r.json())
      .then(d => {
        setOpp(d)
        setForm({
          description: d.description ?? '', salesperson: d.salesperson ?? '',
          status: d.status ?? 'Open', stage: d.stage ?? '',
          probability: String(d.probability ?? 0), estimatedValue: String(d.estimatedValue ?? 0),
          closeDate: d.closeDate ?? '',
        })
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/crm/opportunities/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: form.description || undefined,
        salesperson: form.salesperson || null,
        status: form.status || undefined,
        stage: form.stage || null,
        probability: parseFloat(form.probability || '0'),
        estimatedValue: parseFloat(form.estimatedValue || '0'),
        closeDate: form.closeDate || null,
      }),
    })
    setSaving(false); setEditing(false); load()
  }

  if (loading) return <div className="p-8 text-zinc-500 text-sm animate-pulse">Loading opportunity...</div>
  if (!opp) return <div className="p-8 text-zinc-500 text-sm">Opportunity not found</div>

  const stageIndex = STAGES.indexOf(opp.stage ?? '')
  const closeDateDisplay = opp.closeDate
    ? new Date(opp.closeDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
    : '—'
  const revenueDisplay = `$${(opp.estimatedValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0d0e24] text-white">

      {/* ── Top Ribbon ─────────────────────────────────────────────────── */}
      <div className="border-b border-indigo-500/20 bg-[#0d0e24] px-4 py-2 flex items-center gap-1 flex-wrap">
        <RibbonBtn icon={<ArrowLeft className="w-3.5 h-3.5" />} label="RAD BOT" />
        <RibbonDivider />
        <RibbonBtn icon={<RefreshCw className="w-3.5 h-3.5" />} label="Refresh" onClick={load} />
        <RibbonBtn label="Open Yammer" />
        <RibbonBtn label="Collaborate" />
        <RibbonBtn icon={<Mail className="w-3.5 h-3.5" />} label="Email a Link" />
        <RibbonBtn icon={<Share2 className="w-3.5 h-3.5" />} label="Share" />
        <RibbonBtn icon={<Bell className="w-3.5 h-3.5" />} label="Follow" />
        <RibbonDivider />
        <RibbonBtn icon={<Zap className="w-3.5 h-3.5" />} label="Flow" trailing={<ChevronDown className="w-3 h-3 ml-0.5" />} />
        <RibbonBtn label="Send For Signature" />
        <RibbonBtn icon={<FileText className="w-3.5 h-3.5" />} label="Word Templates" trailing={<ChevronDown className="w-3 h-3 ml-0.5" />} />
        <RibbonBtn label="Run Report" trailing={<ChevronDown className="w-3 h-3 ml-0.5" />} />
      </div>

      {/* ── Opportunity Header ──────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-indigo-500/20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-3">
          <Link href="/crm/opportunities" className="hover:text-zinc-300 transition-colors">Opportunities</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-400">Sales Insights</span>
        </div>

        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar / icon */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Opportunity: Sales Insights</span>
                <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-white">{opp.description}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 font-medium tracking-wide">Read only</span>
              </div>
            </div>
          </div>

          {/* Right: Est. Close + Revenue */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Est. Close Date</p>
              <p className="text-sm text-white font-medium">{closeDateDisplay}</p>
            </div>
            <div className="w-px h-8 bg-indigo-500/20" />
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Est. Revenue</p>
              <p className="text-sm text-white font-semibold">{revenueDisplay}</p>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-colors ml-2">
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
            {editing && (
              <div className="flex items-center gap-2 ml-2">
                <button onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-white rounded transition-colors">
                  <X className="w-3 h-3" /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-medium transition-colors">
                  <Save className="w-3 h-3" /> {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stage progress strip */}
        <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1">
          {STAGES.map((s, i) => {
            const done = stageIndex > i
            const current = stageIndex === i
            return (
              <div key={s} className="flex items-center gap-1 shrink-0">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium transition-colors
                  ${current ? 'bg-indigo-600 text-white' : done ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800/60 text-zinc-500'}`}>
                  {done && <CheckCircle className="w-3 h-3" />}
                  {s}
                </div>
                {i < STAGES.length - 1 && <ChevronRight className="w-3 h-3 text-zinc-700" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <div className="flex border-b border-indigo-500/20 px-6 gap-0 bg-[#0d0e24]">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 px-6 overflow-auto">

        {/* Summary tab */}
        {tab === 'Summary' && (
          <div className="py-5 flex gap-6">
            <div className="flex-1">
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl">
                  {[
                    { label: 'Description *', key: 'description' as const },
                    { label: 'Salesperson Code', key: 'salesperson' as const },
                    { label: 'Probability (%)', key: 'probability' as const, type: 'number' },
                    { label: 'Estimated Value', key: 'estimatedValue' as const, type: 'number' },
                    { label: 'Closing Date', key: 'closeDate' as const, type: 'date' },
                  ].map(({ label, key, type = 'text' }) => (
                    <div key={key}>
                      <label className="text-[11px] text-zinc-400 mb-1 block">{label}</label>
                      <input type={type} value={form[key] ?? ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                  ))}
                  <div>
                    <label className="text-[11px] text-zinc-400 mb-1 block">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                      <option>Open</option><option>Won</option><option>Lost</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 mb-1 block">Stage</label>
                    <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl">
                  {[
                    { label: 'Opportunity No.', value: opp.opportunityNo },
                    { label: 'Contact', value: opp.contactName },
                    { label: 'Salesperson', value: opp.salesperson },
                    { label: 'Status', value: opp.status },
                    { label: 'Stage', value: opp.stage },
                    { label: 'Probability', value: `${opp.probability}%` },
                    { label: 'Estimated Value', value: `$${(opp.estimatedValue ?? 0).toLocaleString()}` },
                    { label: 'Closing Date', value: opp.closeDate ?? '—' },
                    { label: 'Campaign', value: opp.campaignId ?? '—' },
                    { label: 'Created', value: opp.createdAt ? new Date(opp.createdAt).toLocaleDateString() : '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[11px] text-zinc-500 mb-0.5">{label}</p>
                      <p className="text-sm text-white">{value ?? '—'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FactBox */}
            {!editing && (
              <div className="w-56 shrink-0">
                <div className="bg-[#111329] border border-indigo-500/20 rounded-lg p-4">
                  <p className="text-[10px] font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Pipeline Value</p>
                  <p className="text-2xl font-bold text-white">${(opp.estimatedValue ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-zinc-500 mt-1">Probability: {opp.probability}%</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Weighted: ${Math.round((opp.estimatedValue ?? 0) * (opp.probability / 100)).toLocaleString()}
                  </p>
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <p className="text-[10px] text-zinc-500 mb-0.5">Status</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STATUS_COLOR[opp.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {opp.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Relationship Analytics tab */}
        {tab === 'Relationship Analytics' && (
          <RelationshipAnalyticsTab id={id} />
        )}

        {/* Product line items tab */}
        {tab === 'Product line items' && (
          <div className="py-8 text-center text-zinc-600">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No product line items added yet.</p>
            <button className="mt-3 text-xs text-indigo-400 hover:underline">+ Add a product</button>
          </div>
        )}

        {/* Quotes tab */}
        {tab === 'Quotes' && (
          <div className="py-8 text-center text-zinc-600">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No quotes associated with this opportunity.</p>
            <button className="mt-3 text-xs text-indigo-400 hover:underline">+ Create a quote</button>
          </div>
        )}

        {/* Related tab */}
        {tab === 'Related' && (
          <div className="py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Activities', count: 3, href: `/crm/activities` },
              { label: 'Contacts', count: 1, href: `/crm/contacts` },
              { label: 'Campaigns', count: opp.campaignId ? 1 : 0, href: `/crm/campaigns` },
            ].map(item => (
              <Link key={item.label} href={item.href}
                className="bg-[#111329] border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg p-4 flex items-center justify-between transition-colors group">
                <span className="text-sm text-zinc-300 group-hover:text-white">{item.label}</span>
                <span className="text-lg font-bold text-white">{item.count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helper sub-components ───────────────────────────────────────────────────

function RibbonBtn({
  icon, label, trailing, onClick
}: {
  icon?: React.ReactNode; label: string; trailing?: React.ReactNode; onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-indigo-500/10 rounded transition-colors whitespace-nowrap"
    >
      {icon}{label}{trailing}
    </button>
  )
}

function RibbonDivider() {
  return <div className="w-px h-5 bg-indigo-500/20 mx-0.5" />
}
