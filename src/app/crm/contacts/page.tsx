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

interface Contact {
  id: number
  name: string
  jobTitle: string
  company: string
  email: string
  phone: string
  owner: string
  lastActivity: string
  status: 'Active' | 'Inactive'
  opportunities: { id: number; name: string; value: string; stage: string }[]
  cases: { id: number; subject: string; status: string }[]
  timeline: { date: string; text: string }[]
}

const CONTACTS: Contact[] = [
  { id: 1, name: 'John Smith', jobTitle: 'VP Operations', company: 'The Cannon Group', email: 'john.smith@cannon.com', phone: '+1 555 0100', owner: 'Alice Chen', lastActivity: 'Apr 22', status: 'Active', opportunities: [{ id: 1, name: 'ERP Phase 2', value: '$125,000', stage: 'Propose' }, { id: 2, name: 'Cloud Migration', value: '$200,000', stage: 'Develop' }, { id: 3, name: 'Support Contract', value: '$18,000', stage: 'Close' }], cases: [{ id: 1, subject: 'Portal access issue', status: 'Open' }], timeline: [{ date: 'Apr 22', text: 'Email sent — Q2 proposal follow-up' }, { date: 'Apr 20', text: 'Call logged — 14 min discussion on roadmap' }, { date: 'Apr 15', text: 'Meeting — Quarterly business review' }, { date: 'Apr 10', text: 'Quote sent — ERP Phase 2 $125,000' }, { date: 'Apr 5', text: 'Contact created via web form' }] },
  { id: 2, name: 'Jane Martinez', jobTitle: 'CEO', company: 'Fabrikam Inc', email: 'j.martinez@fabrikam.com', phone: '+1 555 0201', owner: 'Bob Wilson', lastActivity: 'Apr 18', status: 'Active', opportunities: [{ id: 4, name: 'HR System Upgrade', value: '$48,000', stage: 'Close' }, { id: 5, name: 'Analytics Suite', value: '$75,000', stage: 'Propose' }, { id: 6, name: 'Training Bundle', value: '$12,000', stage: 'Qualify' }], cases: [{ id: 2, subject: 'Billing discrepancy', status: 'In Progress' }], timeline: [{ date: 'Apr 18', text: 'Email sent — contract renewal terms' }, { date: 'Apr 12', text: 'Call logged — 22 min executive briefing' }, { date: 'Apr 8', text: 'Meeting — Product demo session' }, { date: 'Apr 3', text: 'Quote sent — HR System Upgrade' }, { date: 'Mar 28', text: 'Contact created by Bob Wilson' }] },
  { id: 3, name: 'Mike Brown', jobTitle: 'IT Director', company: 'Contoso Ltd', email: 'm.brown@contoso.com', phone: '+1 555 0302', owner: 'Alice Chen', lastActivity: 'Apr 15', status: 'Active', opportunities: [{ id: 7, name: 'Security Audit', value: '$30,000', stage: 'Develop' }, { id: 8, name: 'Network Upgrade', value: '$95,000', stage: 'Propose' }, { id: 9, name: 'Managed Services', value: '$60,000', stage: 'Close' }], cases: [{ id: 3, subject: 'License key error', status: 'Resolved' }], timeline: [{ date: 'Apr 15', text: 'Call logged — infrastructure assessment' }, { date: 'Apr 10', text: 'Email sent — security audit proposal' }, { date: 'Apr 5', text: 'Meeting — Technical deep dive' }, { date: 'Mar 30', text: 'Quote sent — Managed Services' }, { date: 'Mar 22', text: 'Contact created at TechConf 2026' }] },
  { id: 4, name: 'Sarah Jones', jobTitle: 'CFO', company: 'Adatum Corp', email: 's.jones@adatum.com', phone: '+1 555 0403', owner: 'Carlos M.', lastActivity: 'Apr 10', status: 'Active', opportunities: [{ id: 10, name: 'Finance Module', value: '$55,000', stage: 'Propose' }, { id: 11, name: 'Compliance Pack', value: '$22,000', stage: 'Qualify' }, { id: 12, name: 'Year-End Services', value: '$15,000', stage: 'Close' }], cases: [{ id: 4, subject: 'Report export error', status: 'Open' }], timeline: [{ date: 'Apr 10', text: 'Email sent — FY26 budget planning' }, { date: 'Apr 7', text: 'Call logged — 30 min finance review' }, { date: 'Apr 2', text: 'Meeting — CFO roundtable attendance' }, { date: 'Mar 28', text: 'Quote sent — Finance Module' }, { date: 'Mar 20', text: 'Contact created by Carlos M.' }] },
  { id: 5, name: 'Robert Chen', jobTitle: 'Procurement', company: 'Litware Inc', email: 'r.chen@litware.com', phone: '+1 555 0504', owner: 'Bob Wilson', lastActivity: 'Mar 28', status: 'Inactive', opportunities: [{ id: 13, name: 'Office Supplies Contract', value: '$24,000', stage: 'Qualify' }, { id: 14, name: 'Furniture Refresh', value: '$18,000', stage: 'Develop' }, { id: 15, name: 'Packaging Deal', value: '$9,000', stage: 'Qualify' }], cases: [{ id: 5, subject: 'Delivery delay complaint', status: 'Closed' }], timeline: [{ date: 'Mar 28', text: 'Email sent — procurement terms update' }, { date: 'Mar 20', text: 'Call logged — 10 min check-in' }, { date: 'Mar 15', text: 'Meeting — Vendor evaluation' }, { date: 'Mar 10', text: 'Quote sent — Office Supplies Contract' }, { date: 'Feb 28', text: 'Contact created via import' }] },
  { id: 6, name: 'Emily Davis', jobTitle: 'Sales Manager', company: 'Northwind Traders', email: 'e.davis@northwind.com', phone: '+1 555 0605', owner: 'Alice Chen', lastActivity: 'Apr 21', status: 'Active', opportunities: [{ id: 16, name: 'Data Analytics Platform', value: '$340,000', stage: 'Develop' }, { id: 17, name: 'BI Dashboard', value: '$45,000', stage: 'Propose' }, { id: 18, name: 'Data Warehouse', value: '$120,000', stage: 'Qualify' }], cases: [{ id: 6, subject: 'API integration issue', status: 'Open' }], timeline: [{ date: 'Apr 21', text: 'Email sent — data analytics proposal' }, { date: 'Apr 18', text: 'Call logged — 45 min discovery call' }, { date: 'Apr 12', text: 'Meeting — Executive presentation' }, { date: 'Apr 8', text: 'Quote sent — Data Analytics Platform' }, { date: 'Apr 10', text: 'Contact created at partner summit' }] },
  { id: 7, name: 'David Wilson', jobTitle: 'CTO', company: 'Alpine Ski House', email: 'd.wilson@alpineski.com', phone: '+1 555 0706', owner: 'Carlos M.', lastActivity: 'Apr 19', status: 'Active', opportunities: [{ id: 19, name: 'IoT Integration', value: '$85,000', stage: 'Develop' }, { id: 20, name: 'Mobile App', value: '$60,000', stage: 'Propose' }, { id: 21, name: 'Cloud Infra', value: '$150,000', stage: 'Qualify' }], cases: [], timeline: [{ date: 'Apr 19', text: 'Email sent — IoT project scope' }, { date: 'Apr 14', text: 'Call logged — 20 min tech review' }, { date: 'Apr 9', text: 'Meeting — CTO strategy session' }, { date: 'Apr 4', text: 'Quote sent — IoT Integration' }, { date: 'Mar 30', text: 'Contact created via LinkedIn' }] },
  { id: 8, name: 'Lisa Anderson', jobTitle: 'Marketing Director', company: 'Trey Research', email: 'l.anderson@trey.com', phone: '+1 555 0807', owner: 'Bob Wilson', lastActivity: 'Apr 17', status: 'Active', opportunities: [{ id: 22, name: 'Marketing Automation', value: '$65,000', stage: 'Propose' }, { id: 23, name: 'CRM Module', value: '$35,000', stage: 'Develop' }, { id: 24, name: 'Email Campaign Tool', value: '$20,000', stage: 'Qualify' }], cases: [{ id: 7, subject: 'Email template bug', status: 'In Progress' }], timeline: [{ date: 'Apr 17', text: 'Email sent — marketing automation demo' }, { date: 'Apr 13', text: 'Call logged — 35 min strategy call' }, { date: 'Apr 7', text: 'Meeting — Marketing showcase' }, { date: 'Apr 2', text: 'Quote sent — Marketing Automation' }, { date: 'Mar 28', text: 'Contact created at marketing summit' }] },
  { id: 9, name: 'James Taylor', jobTitle: 'Operations Lead', company: 'Fourth Coffee', email: 'j.taylor@fourthcoffee.com', phone: '+1 555 0908', owner: 'Alice Chen', lastActivity: 'Apr 16', status: 'Active', opportunities: [{ id: 25, name: 'Supply Chain Optimization', value: '$110,000', stage: 'Develop' }, { id: 26, name: 'POS Upgrade', value: '$28,000', stage: 'Propose' }, { id: 27, name: 'Loyalty Program', value: '$15,000', stage: 'Close' }], cases: [], timeline: [{ date: 'Apr 16', text: 'Email sent — supply chain analysis' }, { date: 'Apr 11', text: 'Call logged — 25 min ops review' }, { date: 'Apr 6', text: 'Meeting — Franchise ops meeting' }, { date: 'Apr 1', text: 'Quote sent — Supply Chain Optimization' }, { date: 'Mar 25', text: 'Contact created by Alice Chen' }] },
  { id: 10, name: 'Amanda Clark', jobTitle: 'HR Manager', company: 'Humongous Insurance', email: 'a.clark@humongous.com', phone: '+1 555 1009', owner: 'Carlos M.', lastActivity: 'Apr 14', status: 'Active', opportunities: [{ id: 28, name: 'HRIS Implementation', value: '$90,000', stage: 'Propose' }, { id: 29, name: 'Payroll Module', value: '$40,000', stage: 'Develop' }, { id: 30, name: 'Benefits Portal', value: '$25,000', stage: 'Qualify' }], cases: [{ id: 8, subject: 'Payroll calculation error', status: 'Escalated' }], timeline: [{ date: 'Apr 14', text: 'Email sent — HRIS proposal docs' }, { date: 'Apr 10', text: 'Call logged — 40 min HR review' }, { date: 'Apr 5', text: 'Meeting — HR tech showcase' }, { date: 'Apr 1', text: 'Quote sent — HRIS Implementation' }, { date: 'Mar 27', text: 'Contact created at HR summit' }] },
  { id: 11, name: 'Kevin Martinez', jobTitle: 'Finance Analyst', company: 'Blue Yonder Inc', email: 'k.martinez@blueyonder.com', phone: '+1 555 1110', owner: 'Bob Wilson', lastActivity: 'Apr 13', status: 'Active', opportunities: [{ id: 31, name: 'Treasury Module', value: '$70,000', stage: 'Qualify' }, { id: 32, name: 'Forecasting Tool', value: '$45,000', stage: 'Develop' }, { id: 33, name: 'Budget Planner', value: '$30,000', stage: 'Propose' }], cases: [], timeline: [{ date: 'Apr 13', text: 'Email sent — treasury module specs' }, { date: 'Apr 9', text: 'Call logged — 18 min finance call' }, { date: 'Apr 4', text: 'Meeting — Finance team review' }, { date: 'Mar 30', text: 'Quote sent — Treasury Module' }, { date: 'Mar 24', text: 'Contact created via referral' }] },
  { id: 12, name: 'Patricia Lee', jobTitle: 'Logistics Director', company: 'Relecloud Corp', email: 'p.lee@relecloud.com', phone: '+1 555 1211', owner: 'Alice Chen', lastActivity: 'Apr 12', status: 'Active', opportunities: [{ id: 34, name: 'WMS Integration', value: '$180,000', stage: 'Develop' }, { id: 35, name: 'Fleet Management', value: '$65,000', stage: 'Propose' }, { id: 36, name: 'Route Optimization', value: '$35,000', stage: 'Qualify' }], cases: [{ id: 9, subject: 'WMS sync failure', status: 'In Progress' }], timeline: [{ date: 'Apr 12', text: 'Email sent — WMS integration scoping' }, { date: 'Apr 8', text: 'Call logged — 32 min logistics review' }, { date: 'Apr 3', text: 'Meeting — Logistics tech assessment' }, { date: 'Mar 29', text: 'Quote sent — WMS Integration' }, { date: 'Mar 22', text: 'Contact created at LogiTech Expo' }] },
  { id: 13, name: 'Brian Thompson', jobTitle: 'Product Manager', company: 'Wingtip Toys', email: 'b.thompson@wingtip.com', phone: '+1 555 1312', owner: 'Carlos M.', lastActivity: 'Apr 11', status: 'Active', opportunities: [{ id: 37, name: 'Product Lifecycle Mgmt', value: '$55,000', stage: 'Propose' }, { id: 38, name: 'Quality Module', value: '$28,000', stage: 'Develop' }, { id: 39, name: 'CAD Integration', value: '$40,000', stage: 'Qualify' }], cases: [], timeline: [{ date: 'Apr 11', text: 'Email sent — PLM demo scheduled' }, { date: 'Apr 7', text: 'Call logged — 28 min product review' }, { date: 'Apr 2', text: 'Meeting — Product roadmap session' }, { date: 'Mar 27', text: 'Quote sent — PLM solution' }, { date: 'Mar 20', text: 'Contact created by Carlos M.' }] },
  { id: 14, name: 'Sandra White', jobTitle: 'COO', company: 'Coho Winery', email: 's.white@cohowinery.com', phone: '+1 555 1413', owner: 'Bob Wilson', lastActivity: 'Apr 9', status: 'Active', opportunities: [{ id: 40, name: 'ERP Modernization', value: '$220,000', stage: 'Qualify' }, { id: 41, name: 'Inventory Control', value: '$48,000', stage: 'Develop' }, { id: 42, name: 'Compliance Module', value: '$32,000', stage: 'Propose' }], cases: [{ id: 10, subject: 'Inventory sync issue', status: 'Open' }], timeline: [{ date: 'Apr 9', text: 'Email sent — ERP modernization brief' }, { date: 'Apr 5', text: 'Call logged — 50 min executive call' }, { date: 'Apr 1', text: 'Meeting — Board presentation' }, { date: 'Mar 26', text: 'Quote sent — ERP Modernization' }, { date: 'Mar 18', text: 'Contact created at wine industry conf' }] },
  { id: 15, name: 'Mark Johnson', jobTitle: 'IT Manager', company: 'Proseware Inc', email: 'm.johnson@proseware.com', phone: '+1 555 1514', owner: 'Alice Chen', lastActivity: 'Apr 8', status: 'Active', opportunities: [{ id: 43, name: 'Helpdesk System', value: '$35,000', stage: 'Develop' }, { id: 44, name: 'Asset Management', value: '$22,000', stage: 'Propose' }, { id: 45, name: 'Endpoint Security', value: '$18,000', stage: 'Qualify' }], cases: [], timeline: [{ date: 'Apr 8', text: 'Email sent — helpdesk system specs' }, { date: 'Apr 4', text: 'Call logged — 15 min IT review' }, { date: 'Mar 30', text: 'Meeting — IT infrastructure assessment' }, { date: 'Mar 25', text: 'Quote sent — Helpdesk System' }, { date: 'Mar 18', text: 'Contact created via partner referral' }] },
  { id: 16, name: 'Nancy Evans', jobTitle: 'Purchasing Manager', company: 'Wide World Importers', email: 'n.evans@wideworldimporters.com', phone: '+1 555 1615', owner: 'Carlos M.', lastActivity: 'Apr 7', status: 'Active', opportunities: [{ id: 46, name: 'Procurement Automation', value: '$78,000', stage: 'Propose' }, { id: 47, name: 'Vendor Portal', value: '$42,000', stage: 'Develop' }, { id: 48, name: 'Contract Management', value: '$25,000', stage: 'Qualify' }], cases: [{ id: 11, subject: 'Vendor portal login issue', status: 'Resolved' }], timeline: [{ date: 'Apr 7', text: 'Email sent — procurement automation demo' }, { date: 'Apr 3', text: 'Call logged — 22 min purchasing review' }, { date: 'Mar 29', text: 'Meeting — Procurement strategy session' }, { date: 'Mar 24', text: 'Quote sent — Procurement Automation' }, { date: 'Mar 16', text: 'Contact created at procurement summit' }] },
  { id: 17, name: 'Thomas Harris', jobTitle: 'VP Engineering', company: 'Tailspin Toys', email: 't.harris@tailspin.com', phone: '+1 555 1716', owner: 'Bob Wilson', lastActivity: 'Apr 6', status: 'Active', opportunities: [{ id: 49, name: 'R&D Management', value: '$95,000', stage: 'Develop' }, { id: 50, name: 'Project Tracking', value: '$30,000', stage: 'Propose' }, { id: 51, name: 'Resource Planning', value: '$45,000', stage: 'Qualify' }], cases: [], timeline: [{ date: 'Apr 6', text: 'Email sent — R&D module overview' }, { date: 'Apr 2', text: 'Call logged — 38 min engineering review' }, { date: 'Mar 28', text: 'Meeting — Engineering roadmap' }, { date: 'Mar 23', text: 'Quote sent — R&D Management' }, { date: 'Mar 15', text: 'Contact created by Bob Wilson' }] },
  { id: 18, name: 'Christine Nguyen', jobTitle: 'Customer Success', company: 'Adventure Works', email: 'c.nguyen@adventureworks.com', phone: '+1 555 1817', owner: 'Alice Chen', lastActivity: 'Apr 5', status: 'Active', opportunities: [{ id: 52, name: 'Success Platform', value: '$40,000', stage: 'Close' }, { id: 53, name: 'NPS Integration', value: '$15,000', stage: 'Develop' }, { id: 54, name: 'Renewal Dashboard', value: '$20,000', stage: 'Propose' }], cases: [{ id: 12, subject: 'Dashboard loading slow', status: 'In Progress' }], timeline: [{ date: 'Apr 5', text: 'Email sent — success platform renewal' }, { date: 'Apr 1', text: 'Call logged — 20 min QBR prep' }, { date: 'Mar 27', text: 'Meeting — Customer success review' }, { date: 'Mar 22', text: 'Quote sent — Success Platform renewal' }, { date: 'Mar 14', text: 'Contact created at CS summit' }] },
  { id: 19, name: 'Andrew Peterson', jobTitle: 'Supply Chain Dir.', company: 'Margie Travel', email: 'a.peterson@margietravel.com', phone: '+1 555 1918', owner: 'Carlos M.', lastActivity: 'Apr 4', status: 'Inactive', opportunities: [{ id: 55, name: 'Travel Booking ERP', value: '$130,000', stage: 'Qualify' }, { id: 56, name: 'Expense Management', value: '$28,000', stage: 'Develop' }, { id: 57, name: 'Approval Workflow', value: '$18,000', stage: 'Qualify' }], cases: [], timeline: [{ date: 'Apr 4', text: 'Email sent — travel ERP requirements' }, { date: 'Mar 31', text: 'Call logged — 12 min quick check-in' }, { date: 'Mar 26', text: 'Meeting — Travel ops assessment' }, { date: 'Mar 21', text: 'Quote sent — Travel Booking ERP' }, { date: 'Mar 12', text: 'Contact created via trade show' }] },
  { id: 20, name: 'Michelle Torres', jobTitle: 'Operations Manager', company: 'Bellows College', email: 'm.torres@bellows.edu', phone: '+1 555 2019', owner: 'Bob Wilson', lastActivity: 'Apr 3', status: 'Active', opportunities: [{ id: 58, name: 'Campus ERP', value: '$260,000', stage: 'Propose' }, { id: 59, name: 'Student Portal', value: '$55,000', stage: 'Develop' }, { id: 60, name: 'Finance Integration', value: '$35,000', stage: 'Qualify' }], cases: [{ id: 13, subject: 'Student data export error', status: 'Open' }], timeline: [{ date: 'Apr 3', text: 'Email sent — campus ERP proposal' }, { date: 'Mar 30', text: 'Call logged — 42 min institutional review' }, { date: 'Mar 25', text: 'Meeting — Education sector briefing' }, { date: 'Mar 20', text: 'Quote sent — Campus ERP' }, { date: 'Mar 10', text: 'Contact created at EDU Tech conf' }] },
]

const COLS = ['Name', 'Job Title', 'Company', 'Email', 'Phone', 'Owner', 'Last Activity', 'Status']

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

function AvatarCircle({ name, size = 36 }: { name: string; size?: number }) {
  const colors = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626']
  const colorIndex = name.charCodeAt(0) % colors.length
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: colors[colorIndex], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {initials(name)}
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: status === 'Active' ? '#22c55e' : '#6b7280', display: 'inline-block' }} />
      <span style={{ fontSize: 12, color: status === 'Active' ? '#22c55e' : THEME.muted }}>{status}</span>
    </span>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" style={{ opacity: active ? 1 : 0.3 }}>
      <path d="M5 1L9 5H1L5 1Z" fill={active && dir === 'asc' ? '#6366f1' : THEME.muted} />
      <path d="M5 11L1 7H9L5 11Z" fill={active && dir === 'desc' ? '#6366f1' : THEME.muted} />
    </svg>
  )
}

type SortDir = 'asc' | 'desc'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [sortCol, setSortCol] = useState<string>('Name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [drawer, setDrawer] = useState<Contact | null>(null)
  const [filters, setFilters] = useState({ name: '', company: '', email: '', phone: '', owner: '', source: '', dateFrom: '', dateTo: '', search: '' })

  useEffect(() => {
    let result = [...CONTACTS]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) || c.phone.includes(q)
      )
    }
    if (filters.name) result = result.filter(c => c.name.toLowerCase().includes(filters.name.toLowerCase()))
    if (filters.company) result = result.filter(c => c.company.toLowerCase().includes(filters.company.toLowerCase()))
    if (filters.email) result = result.filter(c => c.email.toLowerCase().includes(filters.email.toLowerCase()))
    if (filters.owner) result = result.filter(c => c.owner.toLowerCase().includes(filters.owner.toLowerCase()))

    result.sort((a, b) => {
      const map: Record<string, keyof Contact> = { 'Name': 'name', 'Job Title': 'jobTitle', 'Company': 'company', 'Email': 'email', 'Phone': 'phone', 'Owner': 'owner', 'Last Activity': 'lastActivity', 'Status': 'status' }
      const key = map[sortCol] || 'name'
      const va = String(a[key]), vb = String(b[key])
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
    setContacts(result)
  }, [filters, sortCol, sortDir])

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const allSelected = contacts.length > 0 && contacts.every(c => selected.has(c.id))
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(contacts.map(c => c.id)))
  const toggleOne = (id: number) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const inputStyle = { background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 6, color: THEME.text, fontSize: 12, padding: '5px 10px', outline: 'none' }
  const btnStyle = (primary?: boolean) => ({ background: primary ? '#4f46e5' : 'transparent', border: `1px solid ${primary ? '#4f46e5' : THEME.border}`, borderRadius: 6, color: primary ? '#fff' : THEME.text, fontSize: 12, padding: '6px 14px', cursor: 'pointer', fontWeight: primary ? 600 : 400 })

  return (
    <div style={{ minHeight: '100dvh', background: THEME.bg, color: THEME.text, fontFamily: 'Geist, Satoshi, system-ui, sans-serif' }}>
      <TopBar
        title="Contacts"
        breadcrumb={[{ label: 'CRM', href: '/crm' }, { label: 'Contacts', href: '/crm/contacts' }]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btnStyle(true)}>New Contact</button>
            <button style={btnStyle()}>Import</button>
            <button style={btnStyle()}>Bulk Email</button>
          </div>
        }
      />

      {/* Filter bar */}
      <div style={{ padding: '12px 24px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', background: THEME.card }}>
        {(['name', 'company', 'email', 'phone', 'owner', 'source'] as const).map(f => (
          <input key={f} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} value={(filters as any)[f]} onChange={e => setFilters(p => ({ ...p, [f]: e.target.value }))} style={{ ...inputStyle, width: 110 }} />
        ))}
        <input type="date" value={filters.dateFrom} onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))} style={{ ...inputStyle, width: 130, colorScheme: 'dark' }} />
        <span style={{ color: THEME.muted, fontSize: 11 }}>to</span>
        <input type="date" value={filters.dateTo} onChange={e => setFilters(p => ({ ...p, dateTo: e.target.value }))} style={{ ...inputStyle, width: 130, colorScheme: 'dark' }} />
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={THEME.muted} strokeWidth="2" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search contacts..." value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} style={{ ...inputStyle, paddingLeft: 28, width: 180 }} />
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
            {contacts.map((c, i) => (
              <tr key={c.id} onClick={() => setDrawer(c)} style={{ borderBottom: `1px solid ${THEME.border}`, background: i % 2 === 0 ? 'transparent' : 'rgba(22,33,62,0.3)', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(22,33,62,0.3)')}>
                <td style={{ padding: '10px 12px', textAlign: 'center' }} onClick={e => { e.stopPropagation(); toggleOne(c.id) }}>
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)} style={{ accentColor: '#4f46e5', cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AvatarCircle name={c.name} size={28} />
                    <span style={{ color: '#818cf8', fontWeight: 500 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 12px', color: THEME.muted }}>{c.jobTitle}</td>
                <td style={{ padding: '10px 12px' }}>{c.company}</td>
                <td style={{ padding: '10px 12px', color: THEME.muted, fontSize: 12 }}>{c.email}</td>
                <td style={{ padding: '10px 12px', color: THEME.muted, fontSize: 12 }}>{c.phone}</td>
                <td style={{ padding: '10px 12px' }}>{c.owner}</td>
                <td style={{ padding: '10px 12px', color: THEME.muted, fontSize: 12 }}>{c.lastActivity}</td>
                <td style={{ padding: '10px 12px' }}><StatusDot status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 0', color: THEME.muted, fontSize: 12 }}>{contacts.length} contact{contacts.length !== 1 ? 's' : ''} {selected.size > 0 && `· ${selected.size} selected`}</div>
      </div>

      {/* Drawer */}
      {drawer && (
        <>
          <div onClick={() => setDrawer(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 400, background: THEME.card, borderLeft: `1px solid ${THEME.border}`, zIndex: 50, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <AvatarCircle name={drawer.name} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{drawer.name}</div>
                <div style={{ color: THEME.muted, fontSize: 13 }}>{drawer.jobTitle}</div>
              </div>
              <button onClick={() => setDrawer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.muted, padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ padding: '16px 24px', flex: 1 }}>
              {/* Contact fields */}
              <section style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.muted, marginBottom: 10, fontWeight: 600 }}>Contact Details</div>
                {[
                  ['Company', drawer.company],
                  ['Email', drawer.email],
                  ['Phone', drawer.phone],
                  ['Owner', drawer.owner],
                  ['Status', drawer.status],
                  ['Last Activity', drawer.lastActivity],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${THEME.border}`, fontSize: 13 }}>
                    <span style={{ color: THEME.muted }}>{label}</span>
                    <span style={{ color: label === 'Status' ? (value === 'Active' ? '#22c55e' : THEME.muted) : THEME.text }}>{value}</span>
                  </div>
                ))}
              </section>

              {/* Linked Opportunities */}
              <section style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.muted, marginBottom: 10, fontWeight: 600 }}>Linked Opportunities ({drawer.opportunities.length})</div>
                {drawer.opportunities.map(o => (
                  <div key={o.id} style={{ padding: '8px 12px', background: '#0d0e24', borderRadius: 6, marginBottom: 6, border: `1px solid ${THEME.border}` }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{o.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                      <span style={{ color: '#818cf8', fontSize: 12 }}>{o.value}</span>
                      <span style={{ color: THEME.muted, fontSize: 11 }}>{o.stage}</span>
                    </div>
                  </div>
                ))}
              </section>

              {/* Linked Cases */}
              {drawer.cases.length > 0 && (
                <section style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.muted, marginBottom: 10, fontWeight: 600 }}>Linked Cases ({drawer.cases.length})</div>
                  {drawer.cases.map(ca => (
                    <div key={ca.id} style={{ padding: '8px 12px', background: '#0d0e24', borderRadius: 6, marginBottom: 6, border: `1px solid ${THEME.border}` }}>
                      <div style={{ fontSize: 13 }}>{ca.subject}</div>
                      <div style={{ color: THEME.muted, fontSize: 11, marginTop: 2 }}>{ca.status}</div>
                    </div>
                  ))}
                </section>
              )}

              {/* Activity Timeline */}
              <section>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.muted, marginBottom: 12, fontWeight: 600 }}>Activity Timeline</div>
                <div style={{ position: 'relative', paddingLeft: 20 }}>
                  <div style={{ position: 'absolute', left: 6, top: 4, bottom: 4, width: 1, background: THEME.border }} />
                  {drawer.timeline.map((t, i) => (
                    <div key={i} style={{ position: 'relative', paddingBottom: 14 }}>
                      <div style={{ position: 'absolute', left: -14, top: 3, width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', border: `2px solid ${THEME.card}` }} />
                      <div style={{ fontSize: 11, color: '#818cf8', marginBottom: 2 }}>{t.date}</div>
                      <div style={{ fontSize: 12, color: THEME.text }}>{t.text}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            {/* Drawer actions */}
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${THEME.border}`, display: 'flex', gap: 8 }}>
              <button style={{ ...btnStyle(true), flex: 1 }}>Send Email</button>
              <button style={{ ...btnStyle(), flex: 1 }}>Log Call</button>
              <button style={{ ...btnStyle(), flex: 1 }}>Edit</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
