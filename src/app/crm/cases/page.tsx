'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const THEME = {
  bg: '#0d0e24',
  card: '#16213e',
  border: 'rgba(99,102,241,0.15)',
  text: '#e2e8f0',
  muted: '#94a3b8',
}

interface CaseItem {
  id: number
  caseNo: string
  subject: string
  customer: string
  contactPerson: string
  phone: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Escalated' | 'Resolved' | 'Closed'
  category: string
  subCategory: string
  agent: string
  created: string
  slaStatus: 'remaining' | 'met' | 'breached'
  slaText: string
  age: string
  description: string
  resolutionNotes: string
  linkedOrder: string
  linkedInvoice: string
  timeline: { time: string; text: string }[]
}

const CASES: CaseItem[] = [
  { id: 1, caseNo: 'CASE-2026-0891', subject: 'Cannot access account portal', customer: 'Fabrikam Inc', contactPerson: 'Jane Martinez', phone: '+1 555 0201', priority: 'High', status: 'Open', category: 'Technical', subCategory: 'Authentication', agent: 'Alice Chen', created: 'Apr 22', slaStatus: 'remaining', slaText: '4h remaining', age: '2h', description: 'Customer reports inability to log in to the self-service account portal. Error message reads "Invalid credentials" despite recent password reset. Issue first reported via web portal at 08:00 AM.', resolutionNotes: '', linkedOrder: 'SO-2026-4812', linkedInvoice: '', timeline: [{ time: 'Apr 22 10:00', text: 'Case opened by customer (web portal)' }, { time: 'Apr 22 10:15', text: 'Auto-assigned to Alice Chen' }, { time: 'Apr 22 11:30', text: 'Alice Chen: "Reviewed issue, requesting logs"' }, { time: 'Apr 22 14:00', text: 'Customer reply: "Logs attached"' }, { time: 'Apr 22 14:30', text: 'Alice Chen: "Investigating"' }] },
  { id: 2, caseNo: 'CASE-2026-0890', subject: 'Billing discrepancy — Invoice 4821', customer: 'Contoso Ltd', contactPerson: 'Mike Brown', phone: '+1 555 0302', priority: 'Medium', status: 'In Progress', category: 'Billing', subCategory: 'Invoice Error', agent: 'Bob Wilson', created: 'Apr 21', slaStatus: 'met', slaText: 'Met', age: '18h', description: 'Customer disputes line item charges on Invoice #INV-4821. Claims a quantity discount of 15% was not applied per contract agreement signed Mar 2026. Total discrepancy: $1,240.', resolutionNotes: 'Reviewing contract terms with Finance team. ETA for resolution: 24h.', linkedOrder: '', linkedInvoice: 'INV-4821', timeline: [{ time: 'Apr 21 09:00', text: 'Case opened via email' }, { time: 'Apr 21 09:20', text: 'Auto-assigned to Bob Wilson' }, { time: 'Apr 21 11:00', text: 'Bob Wilson: "Pulling invoice and contract"' }, { time: 'Apr 21 14:00', text: 'Bob Wilson: "Escalating to Finance for credit review"' }, { time: 'Apr 22 08:00', text: 'Finance team engaged — review in progress' }] },
  { id: 3, caseNo: 'CASE-2026-0889', subject: 'Product defect — Control Panel', customer: 'Adatum Corp', contactPerson: 'Sarah Jones', phone: '+1 555 0403', priority: 'Critical', status: 'Escalated', category: 'Product', subCategory: 'Hardware Defect', agent: 'Manager', created: 'Apr 20', slaStatus: 'breached', slaText: 'Breached', age: '28h', description: 'Critical defect identified in Control Panel unit shipped with order SO-2026-4701. Panel is unresponsive and causing production line stoppage at customer facility. Customer requests immediate on-site support.', resolutionNotes: 'Field engineer dispatched. Replacement unit approved.', linkedOrder: 'SO-2026-4701', linkedInvoice: 'INV-4799', timeline: [{ time: 'Apr 20 07:00', text: 'Case opened via phone — customer flagged as Priority' }, { time: 'Apr 20 07:10', text: 'Assigned to Alice Chen' }, { time: 'Apr 20 09:00', text: 'Alice Chen: "Reproducing defect in test environment"' }, { time: 'Apr 20 14:00', text: 'Escalated to Manager — SLA breach risk' }, { time: 'Apr 21 08:00', text: 'Field engineer scheduled' }] },
  { id: 4, caseNo: 'CASE-2026-0888', subject: 'Return request — SO-2026-4750', customer: 'Fabrikam Inc', contactPerson: 'Jane Martinez', phone: '+1 555 0201', priority: 'Low', status: 'Resolved', category: 'Returns', subCategory: 'Damaged Goods', agent: 'Alice Chen', created: 'Apr 18', slaStatus: 'met', slaText: 'Met', age: '—', description: 'Customer requests return and full refund for 5 units of Product SKU-9021 received in damaged condition. Package inspection photos submitted.', resolutionNotes: 'RMA approved. Credit note issued. Return label sent.', linkedOrder: 'SO-2026-4750', linkedInvoice: 'INV-4780', timeline: [{ time: 'Apr 18 10:00', text: 'Return request submitted via portal' }, { time: 'Apr 18 10:30', text: 'Assigned to Alice Chen' }, { time: 'Apr 18 11:00', text: 'Photos reviewed — damage confirmed' }, { time: 'Apr 18 13:00', text: 'RMA created and approved' }, { time: 'Apr 19 09:00', text: 'Case resolved — credit note issued' }] },
  { id: 5, caseNo: 'CASE-2026-0887', subject: 'System integration error — API 500', customer: 'Northwind Traders', contactPerson: 'Emily Davis', phone: '+1 555 0605', priority: 'High', status: 'In Progress', category: 'Technical', subCategory: 'API', agent: 'Bob Wilson', created: 'Apr 21', slaStatus: 'remaining', slaText: '6h remaining', age: '22h', description: 'REST API returning 500 Internal Server Error when posting order data. Integration partner reports this started after the Apr 20 maintenance window.', resolutionNotes: 'Reviewing server logs from maintenance window.', linkedOrder: '', linkedInvoice: '', timeline: [{ time: 'Apr 21 08:00', text: 'Case opened by integration partner' }, { time: 'Apr 21 08:15', text: 'Assigned to Bob Wilson' }, { time: 'Apr 21 10:00', text: 'Log review started' }, { time: 'Apr 21 14:00', text: 'Bob Wilson: "Found config change — testing fix"' }, { time: 'Apr 22 09:00', text: 'Fix deployed to staging — validating' }] },
  { id: 6, caseNo: 'CASE-2026-0886', subject: 'Incorrect pricing on quote QT-2026-221', customer: 'Litware Inc', contactPerson: 'Robert Chen', phone: '+1 555 0504', priority: 'Medium', status: 'Open', category: 'Sales', subCategory: 'Pricing', agent: 'Carlos M.', created: 'Apr 22', slaStatus: 'remaining', slaText: '8h remaining', age: '1h', description: 'Customer reports quote QT-2026-221 reflects list price instead of negotiated contract price. Volume discount of 20% should apply per 2026 master agreement.', resolutionNotes: '', linkedOrder: '', linkedInvoice: '', timeline: [{ time: 'Apr 22 13:00', text: 'Case opened via phone' }, { time: 'Apr 22 13:10', text: 'Assigned to Carlos M.' }, { time: 'Apr 22 13:30', text: 'Carlos M.: "Reviewing price book and contract"' }, { time: 'Apr 22 14:00', text: 'Contract retrieved — discount confirmed' }, { time: 'Apr 22 14:15', text: 'Quote correction in progress' }] },
  { id: 7, caseNo: 'CASE-2026-0885', subject: 'Shipment delay — Order SO-2026-4788', customer: 'Alpine Ski House', contactPerson: 'David Wilson', phone: '+1 555 0706', priority: 'Medium', status: 'In Progress', category: 'Logistics', subCategory: 'Delivery', agent: 'Alice Chen', created: 'Apr 20', slaStatus: 'met', slaText: 'Met', age: '2d', description: 'Customer reports order SO-2026-4788 is 5 days overdue. Tracking shows shipment stuck at regional hub since Apr 16.', resolutionNotes: 'Carrier contacted — claim filed. Expedited shipment being arranged.', linkedOrder: 'SO-2026-4788', linkedInvoice: '', timeline: [{ time: 'Apr 20 09:00', text: 'Delay reported by customer via email' }, { time: 'Apr 20 09:20', text: 'Assigned to Alice Chen' }, { time: 'Apr 20 11:00', text: 'Carrier investigation opened' }, { time: 'Apr 21 10:00', text: 'Carrier confirmed hub delay — weather event' }, { time: 'Apr 22 08:00', text: 'Expedited ship scheduled for Apr 23' }] },
  { id: 8, caseNo: 'CASE-2026-0884', subject: 'Feature request — Bulk export', customer: 'Trey Research', contactPerson: 'Lisa Anderson', phone: '+1 555 0807', priority: 'Low', status: 'Closed', category: 'Product', subCategory: 'Feature Request', agent: 'Bob Wilson', created: 'Apr 15', slaStatus: 'met', slaText: 'Met', age: '—', description: 'Customer requests bulk CSV export for reporting module. Current export supports max 500 records. Needs 50,000+ for quarterly reports.', resolutionNotes: 'Feature logged in product backlog (PROD-1122). Customer notified of Q3 roadmap inclusion.', linkedOrder: '', linkedInvoice: '', timeline: [{ time: 'Apr 15 10:00', text: 'Feature request submitted' }, { time: 'Apr 15 10:30', text: 'Assigned to Bob Wilson' }, { time: 'Apr 15 11:00', text: 'Reviewed by product team' }, { time: 'Apr 16 09:00', text: 'Added to Q3 backlog (PROD-1122)' }, { time: 'Apr 16 10:00', text: 'Customer notified — case closed' }] },
  { id: 9, caseNo: 'CASE-2026-0883', subject: 'Payroll calculation discrepancy', customer: 'Humongous Insurance', contactPerson: 'Amanda Clark', phone: '+1 555 1009', priority: 'Critical', status: 'Escalated', category: 'Billing', subCategory: 'Payroll', agent: 'Manager', created: 'Apr 19', slaStatus: 'breached', slaText: 'Breached', age: '3d', description: 'HR system is computing overtime pay at standard rate instead of 1.5x for employees classified as non-exempt. Affects 47 employees for the Apr 15 pay cycle. Total discrepancy: $8,400.', resolutionNotes: 'Configuration error identified in overtime rule. Patch being prepared.', linkedOrder: '', linkedInvoice: '', timeline: [{ time: 'Apr 19 08:00', text: 'Issue discovered during payroll audit' }, { time: 'Apr 19 08:30', text: 'Escalated directly to Manager' }, { time: 'Apr 19 10:00', text: 'Root cause analysis started' }, { time: 'Apr 20 09:00', text: 'Config error found in overtime rules engine' }, { time: 'Apr 21 14:00', text: 'Patch in QA testing — release pending' }] },
  { id: 10, caseNo: 'CASE-2026-0882', subject: 'Warranty claim — SKU-7733', customer: 'Coho Winery', contactPerson: 'Sandra White', phone: '+1 555 1413', priority: 'Medium', status: 'Open', category: 'Returns', subCategory: 'Warranty', agent: 'Carlos M.', created: 'Apr 22', slaStatus: 'remaining', slaText: '12h remaining', age: '30m', description: 'Customer claims SKU-7733 unit failed within 6-month warranty period. Serial number: SN-44821. Failure mode: power supply unit non-functional after 120 days.', resolutionNotes: '', linkedOrder: 'SO-2026-4680', linkedInvoice: 'INV-4700', timeline: [{ time: 'Apr 22 14:00', text: 'Warranty claim submitted by phone' }, { time: 'Apr 22 14:10', text: 'Assigned to Carlos M.' }, { time: 'Apr 22 14:20', text: 'Serial number verified — within warranty' }, { time: 'Apr 22 14:30', text: 'Photos requested from customer' }, { time: 'Apr 22 14:45', text: 'Awaiting customer response' }] },
  { id: 11, caseNo: 'CASE-2026-0881', subject: 'Training request — New ERP users', customer: 'Relecloud Corp', contactPerson: 'Patricia Lee', phone: '+1 555 1211', priority: 'Low', status: 'Open', category: 'Training', subCategory: 'Onboarding', agent: 'Alice Chen', created: 'Apr 22', slaStatus: 'remaining', slaText: '1d remaining', age: '4h', description: 'Customer onboarded 12 new users to ERP platform and requests a 2-hour onboarding session. Preferred dates: Apr 28 or Apr 29.', resolutionNotes: '', linkedOrder: '', linkedInvoice: '', timeline: [{ time: 'Apr 22 09:00', text: 'Training request submitted via portal' }, { time: 'Apr 22 09:15', text: 'Assigned to Alice Chen' }, { time: 'Apr 22 10:00', text: 'Training calendar checked' }, { time: 'Apr 22 10:30', text: 'Apr 28 slot proposed to customer' }, { time: 'Apr 22 11:00', text: 'Awaiting customer confirmation' }] },
  { id: 12, caseNo: 'CASE-2026-0880', subject: 'Performance degradation — Reports module', customer: 'Adventure Works', contactPerson: 'Christine Nguyen', phone: '+1 555 1817', priority: 'High', status: 'In Progress', category: 'Technical', subCategory: 'Performance', agent: 'Bob Wilson', created: 'Apr 21', slaStatus: 'remaining', slaText: '3h remaining', age: '20h', description: 'Reports module taking 4–8 minutes to load for datasets over 10,000 rows. Issue started after Apr 18 data migration. Users unable to complete end-of-day reporting.', resolutionNotes: 'Index rebuild scheduled for tonight. Query optimization in progress.', linkedOrder: '', linkedInvoice: '', timeline: [{ time: 'Apr 21 08:00', text: 'Performance issue reported' }, { time: 'Apr 21 08:20', text: 'Assigned to Bob Wilson' }, { time: 'Apr 21 10:00', text: 'Database index audit started' }, { time: 'Apr 21 15:00', text: 'Missing indexes identified on 3 tables' }, { time: 'Apr 22 07:00', text: 'Index rebuild in progress — 60% complete' }] },
  { id: 13, caseNo: 'CASE-2026-0879', subject: 'Duplicate invoice — INV-4805', customer: 'Wide World Importers', contactPerson: 'Nancy Evans', phone: '+1 555 1615', priority: 'Medium', status: 'Resolved', category: 'Billing', subCategory: 'Duplicate', agent: 'Carlos M.', created: 'Apr 17', slaStatus: 'met', slaText: 'Met', age: '—', description: 'Customer received duplicate invoice INV-4805 for order SO-2026-4742. Both invoices total $12,400. Customer requests void of duplicate.', resolutionNotes: 'Duplicate invoice voided. Credit note issued. AR reconciled.', linkedOrder: 'SO-2026-4742', linkedInvoice: 'INV-4805', timeline: [{ time: 'Apr 17 09:00', text: 'Duplicate invoice reported' }, { time: 'Apr 17 09:15', text: 'Assigned to Carlos M.' }, { time: 'Apr 17 10:00', text: 'Duplicate confirmed in billing system' }, { time: 'Apr 17 11:00', text: 'Void processed — credit note sent' }, { time: 'Apr 17 13:00', text: 'Case resolved — customer confirmed' }] },
  { id: 14, caseNo: 'CASE-2026-0878', subject: 'Account reactivation request', customer: 'Margie Travel', contactPerson: 'Andrew Peterson', phone: '+1 555 1918', priority: 'Low', status: 'Closed', category: 'Account', subCategory: 'Reactivation', agent: 'Alice Chen', created: 'Apr 14', slaStatus: 'met', slaText: 'Met', age: '—', description: 'Customer account was auto-suspended due to 90-day inactivity. Customer requests reactivation and access restoration for 4 users.', resolutionNotes: 'Account reactivated. Users restored. Inactivity policy reviewed.', linkedOrder: '', linkedInvoice: '', timeline: [{ time: 'Apr 14 09:00', text: 'Reactivation request submitted' }, { time: 'Apr 14 09:10', text: 'Assigned to Alice Chen' }, { time: 'Apr 14 10:00', text: 'Identity verification completed' }, { time: 'Apr 14 10:30', text: 'Account reactivated — users restored' }, { time: 'Apr 14 11:00', text: 'Case closed' }] },
  { id: 15, caseNo: 'CASE-2026-0877', subject: 'Data export missing fields — GDPR request', customer: 'Bellows College', contactPerson: 'Michelle Torres', phone: '+1 555 2019', priority: 'High', status: 'Open', category: 'Compliance', subCategory: 'GDPR', agent: 'Carlos M.', created: 'Apr 22', slaStatus: 'remaining', slaText: '2h remaining', age: '3h', description: 'GDPR data subject access request (DSAR) submitted. Customer reports that exported data file is missing financial transaction history from 2024–2025. Legal deadline: Apr 29.', resolutionNotes: '', linkedOrder: '', linkedInvoice: '', timeline: [{ time: 'Apr 22 11:00', text: 'GDPR DSAR request received' }, { time: 'Apr 22 11:10', text: 'Assigned to Carlos M. — compliance flagged' }, { time: 'Apr 22 12:00', text: 'Data extraction process initiated' }, { time: 'Apr 22 13:00', text: 'Missing financial records identified' }, { time: 'Apr 22 13:30', text: 'Data team engaged for full extraction' }] },
]

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  Critical: { bg: 'rgba(239,68,68,0.2)', text: '#f87171' },
  High: { bg: 'rgba(249,115,22,0.2)', text: '#fb923c' },
  Medium: { bg: 'rgba(234,179,8,0.2)', text: '#facc15' },
  Low: { bg: 'rgba(34,197,94,0.2)', text: '#4ade80' },
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'Open': { bg: 'rgba(59,130,246,0.2)', text: '#60a5fa' },
  'In Progress': { bg: 'rgba(99,102,241,0.2)', text: '#818cf8' },
  'Escalated': { bg: 'rgba(239,68,68,0.2)', text: '#f87171' },
  'Resolved': { bg: 'rgba(34,197,94,0.2)', text: '#4ade80' },
  'Closed': { bg: 'rgba(100,116,139,0.2)', text: '#94a3b8' },
}

type SortDir = 'asc' | 'desc'

const COLS = ['Case #', 'Subject', 'Customer', 'Priority', 'Status', 'Category', 'Agent', 'Created', 'SLA', 'Age']

function PriorityChip({ p }: { p: string }) {
  const c = PRIORITY_COLORS[p] || PRIORITY_COLORS.Medium
  return <span style={{ background: c.bg, color: c.text, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{p}</span>
}

function StatusChip({ s }: { s: string }) {
  const c = STATUS_COLORS[s] || STATUS_COLORS['Open']
  return <span style={{ background: c.bg, color: c.text, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{s}</span>
}

function SlaCell({ item }: { item: CaseItem }) {
  if (item.slaStatus === 'met') return <span style={{ color: '#4ade80', fontSize: 12 }}>Met</span>
  if (item.slaStatus === 'breached') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
        <span style={{ color: '#f87171', fontSize: 12 }}>Breached</span>
      </span>
    )
  }
  return <span style={{ color: '#fbbf24', fontSize: 12 }}>{item.slaText}</span>
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" style={{ opacity: active ? 1 : 0.3 }}>
      <path d="M5 1L9 5H1L5 1Z" fill={active && dir === 'asc' ? '#6366f1' : THEME.muted} />
      <path d="M5 11L1 7H9L5 11Z" fill={active && dir === 'desc' ? '#6366f1' : THEME.muted} />
    </svg>
  )
}

export default function CasesPage() {
  const [cases, setCases] = useState<CaseItem[]>(CASES)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [sortCol, setSortCol] = useState('Created')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [drawer, setDrawer] = useState<CaseItem | null>(null)
  const [filters, setFilters] = useState({ caseNo: '', subject: '', customer: '', priority: '', status: '', agent: '', category: '', dateFrom: '', dateTo: '', search: '' })

  useEffect(() => {
    let result = [...CASES]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(c => c.caseNo.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q) || c.customer.toLowerCase().includes(q))
    }
    if (filters.caseNo) result = result.filter(c => c.caseNo.toLowerCase().includes(filters.caseNo.toLowerCase()))
    if (filters.subject) result = result.filter(c => c.subject.toLowerCase().includes(filters.subject.toLowerCase()))
    if (filters.customer) result = result.filter(c => c.customer.toLowerCase().includes(filters.customer.toLowerCase()))
    if (filters.priority) result = result.filter(c => c.priority === filters.priority)
    if (filters.status) result = result.filter(c => c.status === filters.status)
    if (filters.agent) result = result.filter(c => c.agent.toLowerCase().includes(filters.agent.toLowerCase()))
    if (filters.category) result = result.filter(c => c.category.toLowerCase().includes(filters.category.toLowerCase()))
    setCases(result)
  }, [filters])

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const allSelected = cases.length > 0 && cases.every(c => selected.has(c.id))
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(cases.map(c => c.id)))
  const toggleOne = (id: number) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const inputStyle = { background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 6, color: THEME.text, fontSize: 12, padding: '5px 10px', outline: 'none' }
  const btnStyle = (primary?: boolean) => ({ background: primary ? '#4f46e5' : 'transparent', border: `1px solid ${primary ? '#4f46e5' : THEME.border}`, borderRadius: 6, color: primary ? '#fff' : THEME.text, fontSize: 12, padding: '6px 14px', cursor: 'pointer', fontWeight: primary ? 600 : 400 })

  const openCount = CASES.filter(c => c.status === 'Open' || c.status === 'In Progress' || c.status === 'Escalated').length
  const breachedCount = CASES.filter(c => c.slaStatus === 'breached').length
  const resolvedToday = CASES.filter(c => c.status === 'Resolved' && c.created === 'Apr 22').length

  return (
    <div style={{ minHeight: '100dvh', background: THEME.bg, color: THEME.text, fontFamily: 'Geist, Satoshi, system-ui, sans-serif' }}>
      {/* Pulse animation */}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }`}</style>

      <TopBar
        title="Customer Cases"
        breadcrumb={[{ label: 'Customer Service', href: '/service' }, { label: 'Cases', href: '/crm/cases' }]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btnStyle(true)}>New Case</button>
            <button style={btnStyle()}>Assign</button>
            <button style={btnStyle()}>Escalate</button>
            <button style={btnStyle()}>Close</button>
          </div>
        }
      />

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, padding: '16px 24px', borderBottom: `1px solid ${THEME.border}` }}>
        {[
          { label: 'Open Cases', value: openCount, color: '#60a5fa', sub: '' },
          { label: 'SLA Breached', value: breachedCount, color: '#f87171', sub: '' },
          { label: 'Resolved Today', value: resolvedToday, color: '#4ade80', sub: '' },
          { label: 'Avg Resolution', value: '18.4 hrs', color: THEME.text, sub: '' },
          { label: 'Customer Satisfaction', value: '4.2 / 5', color: '#fbbf24', sub: '' },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: THEME.card, borderRadius: 8, padding: '12px 16px', border: `1px solid ${THEME.border}` }}>
            <div style={{ fontSize: 11, color: THEME.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ padding: '12px 24px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', background: THEME.card }}>
        {(['caseNo', 'subject', 'customer', 'agent', 'category'] as const).map(f => (
          <input key={f} placeholder={f === 'caseNo' ? 'Case #' : f.charAt(0).toUpperCase() + f.slice(1)} value={filters[f]} onChange={e => setFilters(p => ({ ...p, [f]: e.target.value }))} style={{ ...inputStyle, width: f === 'subject' ? 140 : 100 }} />
        ))}
        <select value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="">Priority</option>
          {['Critical', 'High', 'Medium', 'Low'].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="">Status</option>
          {['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <input type="date" value={filters.dateFrom} onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))} style={{ ...inputStyle, width: 130, colorScheme: 'dark' }} />
        <span style={{ color: THEME.muted, fontSize: 11 }}>to</span>
        <input type="date" value={filters.dateTo} onChange={e => setFilters(p => ({ ...p, dateTo: e.target.value }))} style={{ ...inputStyle, width: 130, colorScheme: 'dark' }} />
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={THEME.muted} strokeWidth="2" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search cases..." value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} style={{ ...inputStyle, paddingLeft: 28, width: 180 }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 24px 24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16, fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${THEME.border}` }}>
              <th style={{ width: 32, padding: '8px 12px', textAlign: 'center' }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ accentColor: '#4f46e5', cursor: 'pointer' }} />
              </th>
              {COLS.map(col => (
                <th key={col} onClick={() => toggleSort(col)} style={{ padding: '8px 12px', textAlign: 'left', color: THEME.muted, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col}
                    <SortIcon active={sortCol === col} dir={sortDir} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cases.map((c, i) => {
              const isBreached = c.slaStatus === 'breached'
              return (
                <tr key={c.id} onClick={() => setDrawer(c)} style={{ borderBottom: `1px solid ${THEME.border}`, background: i % 2 === 0 ? 'transparent' : 'rgba(22,33,62,0.3)', cursor: 'pointer', transition: 'background 0.15s', borderLeft: isBreached ? '3px solid #ef4444' : '3px solid transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(22,33,62,0.3)')}>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }} onClick={e => { e.stopPropagation(); toggleOne(c.id) }}>
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)} style={{ accentColor: '#4f46e5', cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '10px 12px' }}><span style={{ color: '#818cf8', fontWeight: 500, fontSize: 12 }}>{c.caseNo}</span></td>
                  <td style={{ padding: '10px 12px', maxWidth: 200 }}><span style={{ color: THEME.text, fontWeight: 500 }}>{c.subject}</span></td>
                  <td style={{ padding: '10px 12px', color: THEME.muted, fontSize: 12 }}>{c.customer}</td>
                  <td style={{ padding: '10px 12px' }}><PriorityChip p={c.priority} /></td>
                  <td style={{ padding: '10px 12px' }}><StatusChip s={c.status} /></td>
                  <td style={{ padding: '10px 12px', color: THEME.muted, fontSize: 12 }}>{c.category}</td>
                  <td style={{ padding: '10px 12px', color: THEME.muted, fontSize: 12 }}>{c.agent}</td>
                  <td style={{ padding: '10px 12px', color: THEME.muted, fontSize: 12 }}>{c.created}</td>
                  <td style={{ padding: '10px 12px' }}><SlaCell item={c} /></td>
                  <td style={{ padding: '10px 12px', color: THEME.muted, fontSize: 12 }}>{c.age}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ padding: '12px 0', color: THEME.muted, fontSize: 12 }}>{cases.length} case{cases.length !== 1 ? 's' : ''} {selected.size > 0 && `· ${selected.size} selected`}</div>
      </div>

      {/* Case Detail Drawer */}
      {drawer && (
        <>
          <div onClick={() => setDrawer(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 520, background: THEME.card, borderLeft: `1px solid ${THEME.border}`, zIndex: 50, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${THEME.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#818cf8', marginBottom: 4, fontWeight: 600 }}>{drawer.caseNo}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{drawer.subject}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <PriorityChip p={drawer.priority} />
                    <StatusChip s={drawer.status} />
                  </div>
                </div>
                <button onClick={() => setDrawer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.muted, padding: 4 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <div style={{ padding: '16px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Customer info */}
              <section>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.muted, marginBottom: 8, fontWeight: 600 }}>Customer</div>
                {[
                  ['Account', drawer.customer],
                  ['Contact Person', drawer.contactPerson],
                  ['Phone', drawer.phone],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${THEME.border}`, fontSize: 13 }}>
                    <span style={{ color: THEME.muted }}>{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </section>

              {/* Case details */}
              <section>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.muted, marginBottom: 8, fontWeight: 600 }}>Case Details</div>
                {[
                  ['Category', drawer.category],
                  ['Sub-category', drawer.subCategory],
                  ['Agent', drawer.agent],
                  ['Escalation Path', drawer.status === 'Escalated' ? 'Agent → Manager → Director' : 'Standard'],
                  ['Created', drawer.created],
                  ['SLA', drawer.slaText],
                  ['Age', drawer.age],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${THEME.border}`, fontSize: 13 }}>
                    <span style={{ color: THEME.muted }}>{label}</span>
                    <span style={{ color: label === 'SLA' ? (drawer.slaStatus === 'breached' ? '#f87171' : drawer.slaStatus === 'met' ? '#4ade80' : '#fbbf24') : THEME.text }}>{value}</span>
                  </div>
                ))}
              </section>

              {/* Description */}
              <section>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.muted, marginBottom: 8, fontWeight: 600 }}>Description</div>
                <textarea readOnly value={drawer.description} style={{ width: '100%', minHeight: 80, background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: 6, color: THEME.text, fontSize: 12, padding: 10, resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5 }} />
              </section>

              {/* Resolution Notes */}
              <section>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.muted, marginBottom: 8, fontWeight: 600 }}>Resolution Notes</div>
                <textarea readOnly={drawer.status === 'Resolved' || drawer.status === 'Closed'} defaultValue={drawer.resolutionNotes} placeholder="Enter resolution notes..." style={{ width: '100%', minHeight: 70, background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: 6, color: THEME.text, fontSize: 12, padding: 10, resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5 }} />
              </section>

              {/* Activity Timeline */}
              <section>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.muted, marginBottom: 12, fontWeight: 600 }}>Activity Timeline</div>
                <div style={{ position: 'relative', paddingLeft: 20 }}>
                  <div style={{ position: 'absolute', left: 6, top: 4, bottom: 4, width: 1, background: THEME.border }} />
                  {drawer.timeline.map((t, i) => (
                    <div key={i} style={{ position: 'relative', paddingBottom: 14 }}>
                      <div style={{ position: 'absolute', left: -14, top: 3, width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', border: `2px solid ${THEME.card}` }} />
                      <div style={{ fontSize: 11, color: '#818cf8', marginBottom: 2 }}>{t.time}</div>
                      <div style={{ fontSize: 12, color: THEME.text }}>{t.text}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Related Items */}
              {(drawer.linkedOrder || drawer.linkedInvoice) && (
                <section>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.muted, marginBottom: 8, fontWeight: 600 }}>Related Items</div>
                  {drawer.linkedOrder && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${THEME.border}`, fontSize: 13 }}>
                      <span style={{ color: THEME.muted }}>Sales Order</span>
                      <span style={{ color: '#818cf8', fontWeight: 500 }}>{drawer.linkedOrder}</span>
                    </div>
                  )}
                  {drawer.linkedInvoice && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${THEME.border}`, fontSize: 13 }}>
                      <span style={{ color: THEME.muted }}>Invoice</span>
                      <span style={{ color: '#818cf8', fontWeight: 500 }}>{drawer.linkedInvoice}</span>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Drawer action buttons */}
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${THEME.border}`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={{ background: '#4f46e5', border: '1px solid #4f46e5', borderRadius: 6, color: '#fff', fontSize: 12, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>Reply to Customer</button>
              <button style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6, color: '#4ade80', fontSize: 12, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>Resolve Case</button>
              <button style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#f87171', fontSize: 12, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>Escalate</button>
              <button style={{ background: 'transparent', border: `1px solid ${THEME.border}`, borderRadius: 6, color: THEME.text, fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}>Transfer</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
