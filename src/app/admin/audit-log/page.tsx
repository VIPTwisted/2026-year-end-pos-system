export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'

// ─── Static mock data ────────────────────────────────────────────────────────

type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info'

interface AuditRow {
  id: number
  ts: string
  severity: Severity
  user: string
  module: string
  entity: string
  eventType: string
  description: string
  ip: string
  oldVal: string
  newVal: string
}

const AUDIT_ROWS: AuditRow[] = [
  { id: 1,  ts: '2026-04-22 11:47:32', severity: 'Critical', user: 'j.martinez',    module: 'Security',   entity: 'User Account',      eventType: 'Permission Change', description: 'Admin role granted to user account',          ip: '10.0.1.42',  oldVal: 'role=staff',          newVal: 'role=admin' },
  { id: 2,  ts: '2026-04-22 11:31:08', severity: 'High',     user: 'a.chen',        module: 'Finance',    entity: 'GL Journal',        eventType: 'Deleted',           description: 'General ledger entry deleted post-close',      ip: '10.0.1.18',  oldVal: 'JE-00482: $14,200',   newVal: 'DELETED' },
  { id: 3,  ts: '2026-04-22 11:12:54', severity: 'Info',     user: 'k.patel',       module: 'Inventory',  entity: 'Stock Level',        eventType: 'Modified',          description: 'Manual inventory adjustment approved',          ip: '10.0.2.11',  oldVal: 'Qty=34',              newVal: 'Qty=50' },
  { id: 4,  ts: '2026-04-22 10:58:20', severity: 'Medium',   user: 'm.williams',    module: 'HR',         entity: 'Employee Record',   eventType: 'Modified',          description: 'Salary updated for EMP-0047',                   ip: '10.0.1.29',  oldVal: '$68,000/yr',          newVal: '$74,500/yr' },
  { id: 5,  ts: '2026-04-22 10:44:11', severity: 'Info',     user: 't.nguyen',      module: 'Sales',      entity: 'Customer',          eventType: 'Created',           description: 'New customer account created',                  ip: '10.0.3.5',   oldVal: '–',                   newVal: 'ID=CUST-9821' },
  { id: 6,  ts: '2026-04-22 10:38:47', severity: 'High',     user: 'SYSTEM',        module: 'Security',   entity: 'Login',             eventType: 'Login',             description: 'Failed login attempt — account locked',          ip: '203.0.113.8',oldVal: '–',                   newVal: 'LOCKED' },
  { id: 7,  ts: '2026-04-22 10:29:03', severity: 'Info',     user: 'r.smith',       module: 'POS',        entity: 'Transaction',       eventType: 'Created',           description: 'POS transaction TXN-88421 completed',           ip: '10.0.4.2',   oldVal: '–',                   newVal: '$342.80' },
  { id: 8,  ts: '2026-04-22 10:18:55', severity: 'Low',      user: 'j.martinez',    module: 'Finance',    entity: 'Budget',            eventType: 'Modified',          description: 'Q2 marketing budget updated',                   ip: '10.0.1.42',  oldVal: '$180,000',            newVal: '$210,000' },
  { id: 9,  ts: '2026-04-22 10:05:22', severity: 'Info',     user: 'a.chen',        module: 'Finance',    entity: 'Invoice',           eventType: 'Export',            description: 'Invoice batch exported to CSV (284 records)',   ip: '10.0.1.18',  oldVal: '–',                   newVal: 'export_apr22.csv' },
  { id: 10, ts: '2026-04-22 09:58:14', severity: 'Medium',   user: 'k.patel',       module: 'Inventory',  entity: 'Purchase Order',    eventType: 'Modified',          description: 'PO-2026-0838 quantity revised',                 ip: '10.0.2.11',  oldVal: 'Qty=100',             newVal: 'Qty=150' },
  { id: 11, ts: '2026-04-22 09:44:01', severity: 'Critical', user: 'UNKNOWN',       module: 'Security',   entity: 'Login',             eventType: 'Login',             description: 'Brute force detected — IP blocked',              ip: '198.51.100.3',oldVal: '–',                  newVal: 'IP_BLOCKED' },
  { id: 12, ts: '2026-04-22 09:37:28', severity: 'Info',     user: 'b.johnson',     module: 'HR',         entity: 'Timesheet',         eventType: 'Created',           description: 'Timesheet submitted for week ending Apr 20',    ip: '10.0.1.55',  oldVal: '–',                   newVal: '40.0 hrs' },
  { id: 13, ts: '2026-04-22 09:22:11', severity: 'Low',      user: 'm.williams',    module: 'Admin',      entity: 'System Parameter',  eventType: 'Modified',          description: 'Session timeout updated from 30 to 60 minutes',  ip: '10.0.1.29',  oldVal: '30 min',              newVal: '60 min' },
  { id: 14, ts: '2026-04-22 09:11:47', severity: 'Info',     user: 'r.smith',       module: 'POS',        entity: 'Shift',             eventType: 'Created',           description: 'POS shift #SHF-1204 opened at Store #02',       ip: '10.0.4.2',   oldVal: '–',                   newVal: 'OPEN' },
  { id: 15, ts: '2026-04-22 08:59:32', severity: 'High',     user: 'j.martinez',    module: 'Finance',    entity: 'Chart of Accounts', eventType: 'Modified',          description: 'Account 5000-110 reclassified',                 ip: '10.0.1.42',  oldVal: 'Class: COGS',         newVal: 'Class: OpEx' },
  { id: 16, ts: '2026-04-22 08:44:18', severity: 'Info',     user: 't.nguyen',      module: 'Sales',      entity: 'Price List',        eventType: 'Modified',          description: 'Summer 2026 price list activated',              ip: '10.0.3.5',   oldVal: 'INACTIVE',            newVal: 'ACTIVE' },
  { id: 17, ts: '2026-04-22 08:31:04', severity: 'Medium',   user: 'a.chen',        module: 'Finance',    entity: 'Tax Rate',          eventType: 'Modified',          description: 'State tax rate updated for CA',                 ip: '10.0.1.18',  oldVal: '8.5%',                newVal: '8.75%' },
  { id: 18, ts: '2026-04-22 08:18:50', severity: 'Info',     user: 'k.patel',       module: 'Inventory',  entity: 'Supplier',          eventType: 'Created',           description: 'New supplier VEND-0248 onboarded',              ip: '10.0.2.11',  oldVal: '–',                   newVal: 'ID=VEND-0248' },
  { id: 19, ts: '2026-04-22 08:05:22', severity: 'Low',      user: 'b.johnson',     module: 'Admin',      entity: 'Report',            eventType: 'Export',            description: 'Monthly audit report exported',                 ip: '10.0.1.55',  oldVal: '–',                   newVal: 'audit_mar2026.pdf' },
  { id: 20, ts: '2026-04-22 07:58:11', severity: 'Info',     user: 'SYSTEM',        module: 'Admin',      entity: 'Job Queue',         eventType: 'System',            description: 'Nightly batch job completed: 2,847 records',    ip: '127.0.0.1',  oldVal: 'PENDING',             newVal: 'COMPLETE' },
  { id: 21, ts: '2026-04-21 17:44:08', severity: 'Medium',   user: 'r.smith',       module: 'POS',        entity: 'Discount',          eventType: 'Modified',          description: 'Employee discount threshold increased',         ip: '10.0.4.2',   oldVal: '10%',                 newVal: '15%' },
  { id: 22, ts: '2026-04-21 17:28:54', severity: 'Info',     user: 'm.williams',    module: 'HR',         entity: 'Leave Request',     eventType: 'Modified',          description: 'Leave request LVE-0421 approved',               ip: '10.0.1.29',  oldVal: 'PENDING',             newVal: 'APPROVED' },
  { id: 23, ts: '2026-04-21 17:12:33', severity: 'High',     user: 'SYSTEM',        module: 'Security',   entity: 'Login',             eventType: 'Login',             description: 'Failed login — wrong password (attempt 3)',     ip: '10.0.5.88',  oldVal: '–',                   newVal: 'FAILED' },
  { id: 24, ts: '2026-04-21 16:58:47', severity: 'Info',     user: 'j.martinez',    module: 'Finance',    entity: 'Vendor Invoice',    eventType: 'Created',           description: 'Vendor invoice VINV-0882 entered',              ip: '10.0.1.42',  oldVal: '–',                   newVal: '$8,420.00' },
  { id: 25, ts: '2026-04-21 16:44:22', severity: 'Low',      user: 'a.chen',        module: 'Finance',    entity: 'Cost Center',       eventType: 'Created',           description: 'New cost center CC-0038 created',               ip: '10.0.1.18',  oldVal: '–',                   newVal: 'CC-0038: IT Ops' },
  { id: 26, ts: '2026-04-21 16:30:11', severity: 'Info',     user: 'k.patel',       module: 'Inventory',  entity: 'Transfer Order',    eventType: 'Created',           description: 'Stock transfer TO-2026-0441 initiated',         ip: '10.0.2.11',  oldVal: '–',                   newVal: 'Store#01→Store#03' },
  { id: 27, ts: '2026-04-21 16:15:05', severity: 'Medium',   user: 't.nguyen',      module: 'Sales',      entity: 'Customer',          eventType: 'Modified',          description: 'Customer credit limit increased',               ip: '10.0.3.5',   oldVal: '$25,000',             newVal: '$40,000' },
  { id: 28, ts: '2026-04-21 15:58:38', severity: 'Critical', user: 'j.martinez',    module: 'Security',   entity: 'Permission Set',    eventType: 'Permission Change', description: 'Finance write permissions granted to extern user',ip: '10.0.1.42',  oldVal: 'read-only',           newVal: 'read-write' },
  { id: 29, ts: '2026-04-21 15:44:21', severity: 'Info',     user: 'b.johnson',     module: 'HR',         entity: 'Employee Record',   eventType: 'Created',           description: 'New employee EMP-0312 onboarded',               ip: '10.0.1.55',  oldVal: '–',                   newVal: 'EMP-0312: D. Park' },
  { id: 30, ts: '2026-04-21 15:28:47', severity: 'Low',      user: 'r.smith',       module: 'POS',        entity: 'Receipt Template',  eventType: 'Modified',          description: 'Receipt footer updated with new address',        ip: '10.0.4.2',   oldVal: '123 Old St',          newVal: '456 New Ave' },
]

const TOP_USERS = [
  { user: 'j.martinez',  events: 284, role: 'Finance Manager' },
  { user: 'a.chen',      events: 231, role: 'Accountant' },
  { user: 'k.patel',     events: 198, role: 'Inventory Lead' },
  { user: 'SYSTEM',      events: 176, role: 'Automated' },
  { user: 'm.williams',  events: 158, role: 'HR Manager' },
]

const MODULE_COUNTS = [
  { module: 'Finance',   count: 14420, color: '#6366f1' },
  { module: 'Security',  count: 8840,  color: '#ef4444' },
  { module: 'Inventory', count: 7210,  color: '#10b981' },
  { module: 'POS',       count: 6840,  color: '#3b82f6' },
  { module: 'HR',        count: 5380,  color: '#f59e0b' },
  { module: 'Admin',     count: 3840,  color: '#8b5cf6' },
  { module: 'Sales',     count: 1790,  color: '#06b6d4' },
]

const HOURLY = [
  3, 2, 1, 1, 2, 4, 18, 62, 94, 88, 76, 70,
  64, 58, 72, 84, 90, 78, 62, 44, 28, 16, 8, 5,
]

const CRITICAL_EVENTS = [
  { ts: '11:47', desc: 'Admin role granted to j.martinez', user: 'j.martinez' },
  { ts: '09:44', desc: 'Brute force detected — IP blocked', user: 'UNKNOWN' },
  { ts: '15:58', desc: 'Finance write perms granted to external user', user: 'j.martinez' },
]

// ─── SVG helpers ─────────────────────────────────────────────────────────────

function ModulePie() {
  const total = MODULE_COUNTS.reduce((s, m) => s + m.count, 0)
  const cx = 70, cy = 70, r = 55, iR = 30
  let cumAngle = -Math.PI / 2
  const slices = MODULE_COUNTS.map(m => {
    const angle = (m.count / total) * 2 * Math.PI
    const x1 = cx + r * Math.cos(cumAngle)
    const y1 = cy + r * Math.sin(cumAngle)
    cumAngle += angle
    const x2 = cx + r * Math.cos(cumAngle)
    const y2 = cy + r * Math.sin(cumAngle)
    const xi1 = cx + iR * Math.cos(cumAngle - angle)
    const yi1 = cy + iR * Math.sin(cumAngle - angle)
    const xi2 = cx + iR * Math.cos(cumAngle)
    const yi2 = cy + iR * Math.sin(cumAngle)
    const large = angle > Math.PI ? 1 : 0
    const path = `M${xi1},${yi1} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${iR},${iR} 0 ${large},0 ${xi1},${yi1} Z`
    return { ...m, path }
  })
  return (
    <svg viewBox="0 0 140 140" style={{ width: 140, height: 140 }}>
      {slices.map(s => <path key={s.module} d={s.path} fill={s.color} fillOpacity="0.85" />)}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fill="#a1a1aa" fontWeight="600">{MODULE_COUNTS.length}</text>
      <text x={cx} y={cy + 17} textAnchor="middle" fontSize="9" fill="#52525b">Modules</text>
    </svg>
  )
}

function HourlyLine() {
  const W = 220, H = 70, PAD = { t: 8, r: 8, b: 18, l: 24 }
  const cw = W - PAD.l - PAD.r
  const ch = H - PAD.t - PAD.b
  const n = HOURLY.length
  const maxV = Math.max(...HOURLY)
  function xp(i: number) { return PAD.l + (i / (n - 1)) * cw }
  function yp(v: number) { return PAD.t + ((maxV - v) / maxV) * ch }
  const pts = HOURLY.map((v, i) => `${xp(i)},${yp(v)}`).join(' ')
  const area = `M${xp(0)},${yp(HOURLY[0])} L${pts.replace(/^[^ ]+ /, '')}` // just reuse pts
  const areaPts = `M${xp(0)},${yp(HOURLY[0])} ${HOURLY.map((v, i) => `L${xp(i)},${yp(v)}`).join(' ')} L${xp(n - 1)},${PAD.t + ch} L${xp(0)},${PAD.t + ch} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
      <defs>
        <linearGradient id="gHourly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPts} fill="url(#gHourly)" />
      <polyline points={HOURLY.map((v, i) => `${xp(i)},${yp(v)}`).join(' ')} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {[0, 6, 12, 18, 23].map(h => (
        <text key={h} x={xp(h)} y={H - 4} textAnchor="middle" fontSize="7" fill="#52525b">{h}h</text>
      ))}
    </svg>
  )
}

// ─── Severity chip ────────────────────────────────────────────────────────────

function SeverityChip({ sev }: { sev: Severity }) {
  const cfg: Record<Severity, { bg: string; text: string; pulse: boolean }> = {
    Critical: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', pulse: true },
    High:     { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', pulse: false },
    Medium:   { bg: 'rgba(234,179,8,0.12)', text: '#eab308', pulse: false },
    Low:      { bg: 'rgba(63,63,70,0.4)', text: '#71717a', pulse: false },
    Info:     { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', pulse: false },
  }
  const c = cfg[sev]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: c.bg, color: c.text,
      padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {c.pulse && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />}
      {sev}
    </span>
  )
}

function truncate(s: string, n: number) { return s.length > n ? s.slice(0, n) + '…' : s }

// ─── Page component ───────────────────────────────────────────────────────────

export default function AuditLogPage() {
  const kpis = [
    { label: 'Total Events', value: '48,320', color: '#6366f1' },
    { label: 'Today',        value: '1,247',  color: '#3b82f6' },
    { label: 'Critical',     value: '3',      color: '#ef4444' },
    { label: 'Unique Users', value: '28',     color: '#10b981' },
    { label: 'Failed Logins',value: '12',     color: '#f59e0b' },
  ]

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0f0f1a', color: '#e4e4e7' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
      <TopBar
        title="Audit Log"
        breadcrumb={[{ label: 'Admin', href: '/admin' }]}
        actions={
          <>
            <button style={{ padding: '5px 12px', fontSize: 12, background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#a5b4fc', cursor: 'pointer' }}>Export</button>
            <button style={{ padding: '5px 12px', fontSize: 12, background: '#1e293b', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 6, color: '#71717a', cursor: 'pointer' }}>Clear Old Logs</button>
          </>
        }
      />

      <div style={{ padding: '20px 24px 0' }}>
        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 16 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background: '#16213e', border: `1px solid rgba(63,63,70,0.5)`, borderRadius: 10, padding: '14px 16px', borderTop: `2px solid ${k.color}` }}>
              <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Filter strip */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Date Range', opts: ['Today', 'Last 7 Days', 'Last 30 Days', 'Custom'] },
            { label: 'User', opts: ['All Users', 'j.martinez', 'a.chen', 'k.patel', 'm.williams', 'SYSTEM'] },
            { label: 'Module', opts: ['All', 'Finance', 'HR', 'Inventory', 'POS', 'Admin', 'Security'] },
            { label: 'Event Type', opts: ['All', 'Created', 'Modified', 'Deleted', 'Login', 'Export', 'Permission Change', 'System'] },
            { label: 'Severity', opts: ['All', 'Critical', 'High', 'Medium', 'Low', 'Info'] },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#52525b' }}>{f.label}:</span>
              <select style={{
                background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 6,
                color: '#a1a1aa', fontSize: 12, padding: '4px 24px 4px 8px', cursor: 'pointer',
                appearance: 'none',
              }}>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#16213e', border: '1px solid rgba(63,63,70,0.5)',
              borderRadius: 6, padding: '4px 10px',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="5" cy="5" r="4" stroke="#52525b" strokeWidth="1.5"/>
                <path d="M8.5 8.5L11 11" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 12, color: '#52525b' }}>Search events...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-col: table + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, padding: '0 24px 24px', flex: 1, minHeight: 0 }}>

        {/* Audit table */}
        <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(63,63,70,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Event Log</span>
            <span style={{ fontSize: 11, color: '#52525b' }}>30 of 48,320 events · sorted by newest</span>
          </div>
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(63,63,70,0.5)', position: 'sticky', top: 0, background: '#16213e', zIndex: 1 }}>
                  {['Timestamp', 'Severity', 'User', 'Module', 'Entity', 'Event', 'Description', 'IP Address', 'Old Value', 'New Value'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#52525b', fontWeight: 500, whiteSpace: 'nowrap', fontSize: 10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AUDIT_ROWS.map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid rgba(39,39,42,0.4)', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '7px 12px', color: '#71717a', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 10 }}>{row.ts}</td>
                    <td style={{ padding: '7px 12px', whiteSpace: 'nowrap' }}><SeverityChip sev={row.severity} /></td>
                    <td style={{ padding: '7px 12px', color: '#a5b4fc', whiteSpace: 'nowrap' }}>{row.user}</td>
                    <td style={{ padding: '7px 12px', color: '#71717a', whiteSpace: 'nowrap' }}>{row.module}</td>
                    <td style={{ padding: '7px 12px', color: '#d4d4d8', whiteSpace: 'nowrap' }}>{row.entity}</td>
                    <td style={{ padding: '7px 12px', color: '#a1a1aa', whiteSpace: 'nowrap' }}>
                      <span style={{ background: 'rgba(30,41,59,0.8)', padding: '2px 6px', borderRadius: 4 }}>{row.eventType}</span>
                    </td>
                    <td style={{ padding: '7px 12px', color: '#d4d4d8', maxWidth: 200 }}>{truncate(row.description, 50)}</td>
                    <td style={{ padding: '7px 12px', color: '#52525b', fontFamily: 'monospace', fontSize: 10, whiteSpace: 'nowrap' }}>{row.ip}</td>
                    <td style={{ padding: '7px 12px', color: '#71717a', maxWidth: 120 }}><span style={{ background: 'rgba(239,68,68,0.07)', padding: '1px 5px', borderRadius: 3, fontSize: 10 }}>{truncate(row.oldVal, 18)}</span></td>
                    <td style={{ padding: '7px 12px', color: '#71717a', maxWidth: 120 }}><span style={{ background: 'rgba(16,185,129,0.07)', padding: '1px 5px', borderRadius: 3, fontSize: 10 }}>{truncate(row.newVal, 18)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(63,63,70,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#52525b' }}>Showing 30 of 48,320</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {['‹', '1', '2', '3', '...', '1611', '›'].map((p, i) => (
                <button key={i} style={{
                  padding: '3px 8px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
                  background: p === '1' ? '#6366f1' : '#1e293b',
                  border: '1px solid rgba(63,63,70,0.4)',
                  color: p === '1' ? '#fff' : '#71717a',
                }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Summary sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>

          {/* Top users */}
          <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Top Active Users</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TOP_USERS.map((u, i) => {
                const maxEvents = TOP_USERS[0].events
                const pct = (u.events / maxEvents) * 100
                return (
                  <div key={u.user}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <div>
                        <span style={{ fontSize: 12, color: '#a5b4fc' }}>{u.user}</span>
                        <span style={{ fontSize: 10, color: '#52525b', marginLeft: 6 }}>{u.role}</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#71717a' }}>{u.events}</span>
                    </div>
                    <div style={{ height: 3, background: '#27272a', borderRadius: 2 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#6366f1', borderRadius: 2 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Module pie */}
          <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Events by Module</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <ModulePie />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                {MODULE_COUNTS.map(m => (
                  <div key={m.module} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: '#71717a', flex: 1 }}>{m.module}</span>
                    <span style={{ fontSize: 10, color: '#52525b' }}>{(m.count / 1000).toFixed(1)}K</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hourly activity */}
          <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Hourly Activity (Today)</div>
            <HourlyLine />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 9, color: '#3f3f46' }}>Peak: 9–10 AM (94 events)</span>
              <span style={{ fontSize: 9, color: '#3f3f46' }}>Quiet: 2–4 AM</span>
            </div>
          </div>

          {/* Critical events */}
          <div style={{ background: '#16213e', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Critical Events</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CRITICAL_EVENTS.map((e, i) => (
                <div key={i} style={{ padding: '9px 10px', background: 'rgba(239,68,68,0.07)', borderRadius: 7, borderLeft: '2px solid #ef4444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: '#ef4444', fontFamily: 'monospace' }}>{e.ts}</span>
                    <span style={{ fontSize: 10, color: '#fca5a5' }}>{e.user}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#fca5a5', lineHeight: 1.4 }}>{e.desc}</div>
                  <button style={{ marginTop: 6, fontSize: 10, color: '#ef4444', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>
                    Investigate
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
