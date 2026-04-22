'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

/* ─── types ─────────────────────────────────────────────────────── */
interface Worker {
  id: string; fullName: string; firstName: string; lastName: string
  jobTitle: string; department: string; employeeNum: string
  hireDate: string; manager: string; location: string
  employmentType: string; status: 'Active' | 'On Leave' | 'Terminated'
  seniority: string; avatarColor: string; initials: string
}

/* ─── static worker data ─────────────────────────────────────────── */
const WORKER: Worker = {
  id: 'EMP-2022-0048',
  fullName: 'Jordan Rivera',
  firstName: 'Jordan',
  lastName: 'Rivera',
  jobTitle: 'Senior Operations Analyst',
  department: 'Operations',
  employeeNum: 'EMP-2022-0048',
  hireDate: 'January 17, 2022',
  manager: 'Sarah Chen',
  location: 'Chicago, IL — Main Office',
  employmentType: 'Full-Time',
  status: 'Active',
  seniority: '4 years 3 months',
  avatarColor: '#7c3aed',
  initials: 'JR',
}

const TABS = ['Employment','Compensation','Benefits','Leave','Performance','Documents','Training'] as const
type Tab = typeof TABS[number]

/* ─── helpers ────────────────────────────────────────────────────── */
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'Active':     { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
    'On Leave':   { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
    'Terminated': { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
  }
  const c = map[status] ?? { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' }
  return <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 5, fontSize: 12, fontWeight: 600 }}>{status}</span>
}

function FastTab({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
      <summary style={{ padding: '11px 18px', fontSize: 13, fontWeight: 700, color: '#e2e8f0', cursor: 'pointer', background: 'rgba(99,102,241,0.05)', listStyle: 'none', userSelect: 'none' }}>
        {title}
      </summary>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </details>
  )
}

function FieldGrid({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px 24px' }}>
      {items.map(([label, value]) => (
        <div key={label}>
          <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 13, color: '#e2e8f0' }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

function ProgressBar({ value, max, color = '#6366f1' }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color }} />
      </div>
      <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 56, textAlign: 'right' }}>{value}/{max}</span>
    </div>
  )
}

/* ─── tab contents ───────────────────────────────────────────────── */
function EmploymentTab() {
  const TH = ({ ch }: { ch: string }) => (
    <th style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', whiteSpace: 'nowrap' }}>{ch}</th>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FastTab title="Position Details">
        <FieldGrid items={[
          ['Position ID',      'POS-OPS-0048'],
          ['Job Title',        'Senior Operations Analyst'],
          ['Department',       'Operations'],
          ['Reports To',       'Sarah Chen'],
          ['Direct Reports',   '3'],
          ['Cost Center',      'CC-4200'],
          ['Job Code',         'JC-OPAN-SR'],
          ['FLSA Status',      'Exempt'],
        ]} />
      </FastTab>

      <FastTab title="Work Schedule">
        <FieldGrid items={[
          ['Schedule',         'Monday – Friday'],
          ['Hours',            '9:00 AM – 5:00 PM'],
          ['Weekly Hours',     '40 hours'],
          ['Work Arrangement', 'Hybrid (3 days in-office)'],
          ['Time Zone',        'America/Chicago (CT)'],
          ['Lunch Break',      '30 minutes (unpaid)'],
        ]} />
      </FastTab>

      <FastTab title="Employment History">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'rgba(99,102,241,0.05)' }}>
              {['Effective Date','Position','Department','Action','Changed By'].map(h => <TH key={h} ch={h} />)}
            </tr>
          </thead>
          <tbody>
            {[
              { date:'Jan 2024', pos:'Senior Operations Analyst',   dept:'Operations', action:'Promotion',   by:'Sarah Chen' },
              { date:'Jan 2023', pos:'Operations Analyst II',       dept:'Operations', action:'Promotion',   by:'Sarah Chen' },
              { date:'Jan 2022', pos:'Operations Analyst I',        dept:'Operations', action:'New Hire',    by:'HR - Onboarding' },
            ].map((r, i) => (
              <tr key={i} style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                <td style={{ padding: '9px 12px', color: '#94a3b8' }}>{r.date}</td>
                <td style={{ padding: '9px 12px', color: '#e2e8f0' }}>{r.pos}</td>
                <td style={{ padding: '9px 12px', color: '#94a3b8' }}>{r.dept}</td>
                <td style={{ padding: '9px 12px' }}>
                  <span style={{ background: r.action === 'Promotion' ? 'rgba(99,102,241,0.15)' : 'rgba(34,197,94,0.15)', color: r.action === 'Promotion' ? '#a5b4fc' : '#4ade80', padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{r.action}</span>
                </td>
                <td style={{ padding: '9px 12px', color: '#64748b' }}>{r.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </FastTab>
    </div>
  )
}

function CompensationTab() {
  const TH = ({ ch }: { ch: string }) => (
    <th style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', whiteSpace: 'nowrap' }}>{ch}</th>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 12, color: '#fcd34d' }}>
        Manager access required to view exact compensation figures. Displayed values are for authorized HR roles only.
      </div>

      <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '18px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Current Compensation</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label:'Pay Type',        value:'Salary' },
            { label:'Annual Amount',   value:'$84,000' },
            { label:'Hourly Equivalent',value:'$40.38/hr' },
            { label:'Pay Grade',       value:'Grade 6' },
            { label:'Last Increase',   value:'Jan 2026 (+3.5%)' },
            { label:'Next Review',     value:'January 2027' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(99,102,241,0.05)', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Compensation History</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'rgba(99,102,241,0.03)' }}>
              {['Effective Date','Pay Type','Amount','Change %','Reason','Approved By'].map(h => <TH key={h} ch={h} />)}
            </tr>
          </thead>
          <tbody>
            {[
              { date:'Jan 1, 2026', type:'Salary', amount:'$84,000', change:'+3.5%', reason:'Annual Review', by:'Sarah Chen' },
              { date:'Jan 1, 2025', type:'Salary', amount:'$81,160', change:'+3.0%', reason:'Annual Review', by:'Sarah Chen' },
              { date:'Jan 1, 2024', type:'Salary', amount:'$78,800', change:'+10.0%',reason:'Promotion',     by:'Sarah Chen' },
            ].map((r, i) => (
              <tr key={i} style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                <td style={{ padding: '9px 12px', color: '#94a3b8' }}>{r.date}</td>
                <td style={{ padding: '9px 12px', color: '#e2e8f0' }}>{r.type}</td>
                <td style={{ padding: '9px 12px', color: '#4ade80', fontWeight: 600 }}>{r.amount}</td>
                <td style={{ padding: '9px 12px', color: '#a5b4fc', fontWeight: 600 }}>{r.change}</td>
                <td style={{ padding: '9px 12px', color: '#94a3b8' }}>{r.reason}</td>
                <td style={{ padding: '9px 12px', color: '#64748b' }}>{r.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BenefitsTab() {
  const plans = [
    { plan:'Medical (Blue Cross PPO)', coverage:'Employee + Family', empCost:'$320/mo', empRCost:'$980/mo', effective:'Jan 1, 2026' },
    { plan:'Dental (Delta Dental)',    coverage:'Employee + Family', empCost:'$48/mo',  empRCost:'$62/mo',  effective:'Jan 1, 2026' },
    { plan:'Vision (VSP)',             coverage:'Employee + Family', empCost:'$18/mo',  empRCost:'$12/mo',  effective:'Jan 1, 2026' },
    { plan:'401(k) Traditional',      coverage:'6% match',          empCost:'$420/mo', empRCost:'$420/mo', effective:'Apr 1, 2022' },
    { plan:'FSA - Medical',           coverage:'$2,400 elected',    empCost:'$200/mo', empRCost:'N/A',     effective:'Jan 1, 2026' },
  ]
  const TH = ({ ch }: { ch: string }) => (
    <th style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', whiteSpace: 'nowrap' }}>{ch}</th>
  )
  return (
    <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead style={{ background: 'rgba(99,102,241,0.05)' }}>
          <tr>{['Plan','Coverage','Employee Cost','Employer Cost','Effective'].map(h => <TH key={h} ch={h} />)}</tr>
        </thead>
        <tbody>
          {plans.map((p, i) => (
            <tr key={p.plan} style={{ borderTop: '1px solid rgba(99,102,241,0.08)', background: i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
              <td style={{ padding: '10px 12px', color: '#e2e8f0', fontWeight: 600 }}>{p.plan}</td>
              <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{p.coverage}</td>
              <td style={{ padding: '10px 12px', color: '#fbbf24', fontWeight: 600 }}>{p.empCost}</td>
              <td style={{ padding: '10px 12px', color: '#4ade80', fontWeight: 600 }}>{p.empRCost}</td>
              <td style={{ padding: '10px 12px', color: '#64748b' }}>{p.effective}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LeaveTab() {
  const balances = [
    { type:'PTO',   used:12, total:15, color:'#a5b4fc' },
    { type:'Sick',  used:8,  total:10, color:'#f87171' },
    { type:'FMLA',  used:84, total:84, color:'#fbbf24', unit:'hrs' },
  ]
  const TH = ({ ch }: { ch: string }) => (
    <th style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', whiteSpace: 'nowrap' }}>{ch}</th>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {balances.map(b => (
          <div key={b.type} style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '14px 16px', background: '#16213e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{b.type}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: b.color }}>{b.used}/{b.total}{b.unit ? ' ' + b.unit : ' days'}</span>
            </div>
            <ProgressBar value={b.used} max={b.total} color={b.color} />
          </div>
        ))}
      </div>
      <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(99,102,241,0.05)', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Leave Requests</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'rgba(99,102,241,0.03)' }}>
              {['Dates','Type','Days','Reason','Status'].map(h => <TH key={h} ch={h} />)}
            </tr>
          </thead>
          <tbody>
            {[
              { dates:'Apr 14–15, 2026', type:'PTO',        days:2, reason:'Personal',    status:'Approved' },
              { dates:'Mar 20, 2026',    type:'Sick',       days:1, reason:'Illness',     status:'Approved' },
              { dates:'Mar 7, 2026',     type:'PTO',        days:1, reason:'Personal',    status:'Approved' },
              { dates:'Feb 18–19, 2026', type:'PTO',        days:2, reason:'Vacation',    status:'Approved' },
              { dates:'Feb 3, 2026',     type:'Sick',       days:1, reason:'Illness',     status:'Approved' },
            ].map((r, i) => {
              const sc: Record<string, { bg: string; color: string }> = {
                'Approved': { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
                'Pending':  { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
                'Denied':   { bg: 'rgba(239,68,68,0.15)',  color: '#f87171' },
              }
              const c = sc[r.status] ?? sc['Pending']
              return (
                <tr key={i} style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                  <td style={{ padding: '9px 12px', color: '#e2e8f0' }}>{r.dates}</td>
                  <td style={{ padding: '9px 12px', color: '#a5b4fc', fontWeight: 600 }}>{r.type}</td>
                  <td style={{ padding: '9px 12px', color: '#94a3b8' }}>{r.days}</td>
                  <td style={{ padding: '9px 12px', color: '#94a3b8' }}>{r.reason}</td>
                  <td style={{ padding: '9px 12px' }}><span style={{ background: c.bg, color: c.color, padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{r.status}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PerformanceTab() {
  const reviews = [
    { date:'Jan 2026', rating:'Exceeds Expectations', ratingNum:4, reviewer:'Sarah Chen', highlights:'Led cross-functional project, exceeded Q4 targets by 18%.' },
    { date:'Jan 2025', rating:'Meets Expectations',   ratingNum:3, reviewer:'Sarah Chen', highlights:'Consistent delivery, on-boarded two new team members effectively.' },
    { date:'Jan 2024', rating:'Exceeds Expectations', ratingNum:4, reviewer:'Mark Davis',  highlights:'Promoted to Senior Analyst, spearheaded logistics optimization.' },
  ]
  const goals = [
    { goal:'Complete ERP migration documentation',    pct:80, status:'On Track' },
    { goal:'Achieve PMP certification by Q3 2026',   pct:45, status:'In Progress' },
    { goal:'Reduce order processing time by 15%',    pct:100,status:'Completed' },
    { goal:'Mentor 2 junior analysts',               pct:60, status:'In Progress' },
    { goal:'Lead quarterly ops review Q2',           pct:10, status:'Not Started' },
  ]
  const ratingColors: Record<number, string> = { 5:'#4ade80', 4:'#a5b4fc', 3:'#fbbf24', 2:'#f87171', 1:'#ef4444' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {reviews.map(r => (
          <div key={r.date} style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '14px 16px', background: '#16213e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{r.date}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: ratingColors[r.ratingNum] ?? '#94a3b8' }}>{'★'.repeat(r.ratingNum)}{'☆'.repeat(5 - r.ratingNum)}</span>
            </div>
            <div style={{ fontSize: 11, color: '#a5b4fc', marginBottom: 4 }}>{r.rating}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Reviewer: {r.reviewer}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.highlights}</div>
          </div>
        ))}
      </div>
      <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '16px 18px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Current Goals</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {goals.map((g, i) => {
            const sc: Record<string, string> = { 'On Track':'#4ade80', 'In Progress':'#fbbf24', 'Completed':'#4ade80', 'Not Started':'#64748b' }
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: '#e2e8f0' }}>{g.goal}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: sc[g.status] ?? '#94a3b8' }}>{g.status}</span>
                </div>
                <ProgressBar value={g.pct} max={100} color={sc[g.status] ?? '#6366f1'} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DocumentsTab() {
  const docs = [
    { name:'I-9 Employment Eligibility',     date:'Apr 2022',  type:'Legal',      size:'142 KB' },
    { name:'W-4 Federal Withholding',        date:'Apr 2022',  type:'Tax',        size:'98 KB' },
    { name:'Offer Letter',                   date:'Jan 2022',  type:'HR',         size:'215 KB' },
    { name:'Non-Disclosure Agreement',       date:'Jan 2022',  type:'Legal',      size:'188 KB' },
    { name:'Performance Review 2025',        date:'Jan 2026',  type:'Performance',size:'304 KB' },
  ]
  const TH = ({ ch }: { ch: string }) => (
    <th style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', whiteSpace: 'nowrap' }}>{ch}</th>
  )
  const typeColor: Record<string, string> = { 'Legal':'#f87171', 'Tax':'#fbbf24', 'HR':'#a5b4fc', 'Performance':'#4ade80' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: 'rgba(99,102,241,0.05)' }}>
            <tr>{['Document','Date','Type','Size',''].map(h => <TH key={h} ch={h} />)}</tr>
          </thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={d.name} style={{ borderTop: '1px solid rgba(99,102,241,0.08)', background: i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                <td style={{ padding: '10px 12px', color: '#e2e8f0', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none"><rect x="1" y="1" width="12" height="14" rx="1.5" stroke="#6366f1" strokeWidth="1.2"/><path d="M4 5h6M4 8h6M4 11h3" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    {d.name}
                  </div>
                </td>
                <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{d.date}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ background: `${typeColor[d.type]}22`, color: typeColor[d.type] ?? '#94a3b8', padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{d.type}</span>
                </td>
                <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 12 }}>{d.size}</td>
                <td style={{ padding: '10px 12px' }}>
                  <button style={{ fontSize: 11, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <button style={{ padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer' }}>Upload Document</button>
      </div>
    </div>
  )
}

function TrainingTab() {
  const TH = ({ ch }: { ch: string }) => (
    <th style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', whiteSpace: 'nowrap' }}>{ch}</th>
  )
  const courses = [
    { course:'NovaPOS System Administration',    date:'Mar 2026',  score:'94%', cert:true },
    { course:'Advanced Excel & Power BI',        date:'Nov 2025',  score:'88%', cert:true },
    { course:'Project Management Fundamentals',  date:'Aug 2025',  score:'91%', cert:true },
    { course:'Workplace Safety & Compliance',    date:'Jun 2025',  score:'100%',cert:true },
    { course:'Data Privacy & GDPR Basics',       date:'Apr 2025',  score:'86%', cert:true },
    { course:'Leadership Essentials',            date:'Jan 2025',  score:'89%', cert:true },
    { course:'SQL for Business Analysts',        date:'Oct 2024',  score:'92%', cert:true },
    { course:'Lean Six Sigma Yellow Belt',       date:'Jul 2024',  score:'78%', cert:true },
    { course:'Conflict Resolution',              date:'Apr 2024',  score:'95%', cert:false },
    { course:'OSHA 10-Hour General Industry',    date:'Feb 2024',  score:'Pass',cert:true },
    { course:'Business Writing Skills',          date:'Nov 2023',  score:'90%', cert:false },
    { course:'NovaPOS New Employee Orientation', date:'Jan 2022',  score:'Pass',cert:true },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label:'Completed',    value:'12', color:'#4ade80' },
          { label:'In Progress',  value:'1',  color:'#fbbf24' },
          { label:'Required/Overdue', value:'0', color:'#64748b' },
        ].map(t => (
          <div key={t.label} style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: t.color }}>{t.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '12px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#fcd34d', marginBottom: 4 }}>In Progress</div>
        <div style={{ fontSize: 13, color: '#e2e8f0' }}>PMP Exam Prep — 45% complete · Target: Sep 2026</div>
      </div>

      <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(99,102,241,0.05)', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Completed Training</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'rgba(99,102,241,0.03)' }}>
              {['Course','Date Completed','Score','Certificate'].map(h => <TH key={h} ch={h} />)}
            </tr>
          </thead>
          <tbody>
            {courses.map((c, i) => (
              <tr key={c.course} style={{ borderTop: '1px solid rgba(99,102,241,0.08)', background: i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                <td style={{ padding: '9px 12px', color: '#e2e8f0' }}>{c.course}</td>
                <td style={{ padding: '9px 12px', color: '#94a3b8' }}>{c.date}</td>
                <td style={{ padding: '9px 12px', color: '#a5b4fc', fontWeight: 600 }}>{c.score}</td>
                <td style={{ padding: '9px 12px' }}>
                  {c.cert ? <span style={{ color: '#4ade80', fontWeight: 600, fontSize: 13 }}>✓ Earned</span> : <span style={{ color: '#64748b', fontSize: 12 }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── main page ──────────────────────────────────────────────────── */
export default function WorkerDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<Tab>('Employment')

  useEffect(() => {
    fetch(`/api/hr/workers/${params.id}`).then(r => r.json()).catch(() => {})
  }, [params.id])

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title={WORKER.fullName}
        breadcrumb={[
          { label: 'Human Resources', href: '/hr' },
          { label: 'Workers', href: '/hr/workers' },
          { label: WORKER.fullName, href: `/hr/workers/${params.id}` },
        ]}
        actions={
          <>
            <button style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', cursor: 'pointer' }}>Edit</button>
            {['Transfer','Terminate','History'].map(a => (
              <button key={a} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }}>{a}</button>
            ))}
          </>
        }
      />

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header card */}
        <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Avatar */}
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: WORKER.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff', flexShrink: 0, border: '3px solid rgba(99,102,241,0.3)' }}>
              {WORKER.initials}
            </div>
            {/* Name + title */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>{WORKER.fullName}</div>
              <div style={{ fontSize: 14, color: '#a5b4fc', marginTop: 2 }}>{WORKER.jobTitle}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{WORKER.department}</div>
            </div>
            {/* Middle meta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 32px' }}>
              {[
                ['Employee #',        WORKER.employeeNum],
                ['Hire Date',         WORKER.hireDate],
                ['Manager',           WORKER.manager],
                ['Location',          WORKER.location],
                ['Employment Type',   WORKER.employmentType],
                ['Seniority',         WORKER.seniority],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Status + seniority */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
              <StatusChip status={WORKER.status} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tenure</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#a5b4fc', marginTop: 2 }}>{WORKER.seniority}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab strip */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: '8px 16px', fontSize: 13, fontWeight: activeTab === t ? 600 : 400,
                color: activeTab === t ? '#a5b4fc' : '#64748b',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === t ? '2px solid #6366f1' : '2px solid transparent',
                marginBottom: -1, transition: 'color 0.15s',
              }}
            >{t}</button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'Employment'   && <EmploymentTab />}
          {activeTab === 'Compensation' && <CompensationTab />}
          {activeTab === 'Benefits'     && <BenefitsTab />}
          {activeTab === 'Leave'        && <LeaveTab />}
          {activeTab === 'Performance'  && <PerformanceTab />}
          {activeTab === 'Documents'    && <DocumentsTab />}
          {activeTab === 'Training'     && <TrainingTab />}
        </div>
      </div>
    </div>
  )
}
