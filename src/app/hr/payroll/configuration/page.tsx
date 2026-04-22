'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

/* ─── types ─────────────────────────────────────────────────────── */
type PeriodStatus = 'Upcoming' | 'Completed' | 'In Progress'

interface PayPeriod {
  num: string; start: string; end: string; payDate: string
  status: PeriodStatus; employees: number
  gross: string; taxes: string; net: string
}

interface PayCode {
  code: string; description: string; type: string
  taxTreatment: string; glAccount: string; active: boolean
}

/* ─── seed data ──────────────────────────────────────────────────── */
const PAY_PERIODS: PayPeriod[] = [
  { num:'PPD-2026-09', start:'Apr 16', end:'Apr 30', payDate:'May 5',  status:'Upcoming',   employees:52, gross:'—',        taxes:'—',       net:'—' },
  { num:'PPD-2026-08', start:'Apr 1',  end:'Apr 15', payDate:'Apr 20', status:'Completed',  employees:52, gross:'$186,240', taxes:'$44,135', net:'$142,105' },
  { num:'PPD-2026-07', start:'Mar 16', end:'Mar 31', payDate:'Apr 5',  status:'Completed',  employees:51, gross:'$183,800', taxes:'$43,620', net:'$140,180' },
  { num:'PPD-2026-06', start:'Mar 1',  end:'Mar 15', payDate:'Mar 20', status:'Completed',  employees:51, gross:'$184,100', taxes:'$43,720', net:'$140,380' },
  { num:'PPD-2026-05', start:'Feb 16', end:'Feb 28', payDate:'Mar 5',  status:'Completed',  employees:50, gross:'$181,600', taxes:'$43,100', net:'$138,500' },
  { num:'PPD-2026-04', start:'Feb 1',  end:'Feb 15', payDate:'Feb 20', status:'Completed',  employees:50, gross:'$180,400', taxes:'$42,800', net:'$137,600' },
]

const PAY_CODES: PayCode[] = [
  { code:'REG-SAL',   description:'Regular Salary',          type:'Earnings',   taxTreatment:'Taxable', glAccount:'6000', active:true },
  { code:'OVT-1.5',   description:'Overtime 1.5x',           type:'Earnings',   taxTreatment:'Taxable', glAccount:'6000', active:true },
  { code:'BONUS-Q',   description:'Quarterly Bonus',         type:'Earnings',   taxTreatment:'Taxable', glAccount:'6010', active:true },
  { code:'COMM',      description:'Commission',              type:'Earnings',   taxTreatment:'Taxable', glAccount:'6020', active:true },
  { code:'HEALTH',    description:'Health Insurance',        type:'Deduction',  taxTreatment:'Pre-tax', glAccount:'2100', active:true },
  { code:'401K',      description:'401(k) Contribution',     type:'Deduction',  taxTreatment:'Pre-tax', glAccount:'2110', active:true },
  { code:'FED-IT',    description:'Federal Income Tax',      type:'Tax',        taxTreatment:'N/A',     glAccount:'2200', active:true },
  { code:'SS-EE',     description:'Social Security (EE)',    type:'Tax',        taxTreatment:'N/A',     glAccount:'2210', active:true },
  { code:'MEDIC',     description:'Medicare',                type:'Tax',        taxTreatment:'N/A',     glAccount:'2220', active:true },
  { code:'STATE-IL',  description:'Illinois State Tax',      type:'Tax',        taxTreatment:'N/A',     glAccount:'2230', active:true },
  { code:'HSA',       description:'HSA Contribution',        type:'Deduction',  taxTreatment:'Pre-tax', glAccount:'2120', active:true },
  { code:'LIFE-INS',  description:'Life Insurance',          type:'Deduction',  taxTreatment:'Post-tax',glAccount:'2130', active:false },
]

const TABS = ['Pay Periods','Pay Codes','Deductions','Tax Settings','Direct Deposit','Earning Codes'] as const
type Tab = typeof TABS[number]

const STATUS_STYLE: Record<PeriodStatus, { bg: string; color: string }> = {
  'Upcoming':   { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  'Completed':  { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
  'In Progress':{ bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
}

const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  'Earnings':  { bg: 'rgba(99,102,241,0.15)',  color: '#a5b4fc' },
  'Deduction': { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
  'Tax':       { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
}

/* ─── helpers ────────────────────────────────────────────────────── */
function Chip({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <span style={{ background: bg, color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
      {text}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
      {children}
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  height: 34, padding: '0 10px', borderRadius: 6,
  border: '1px solid rgba(99,102,241,0.2)', background: '#16213e',
  color: '#e2e8f0', fontSize: 13, outline: 'none', width: '100%',
}

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

/* ─── tab contents ───────────────────────────────────────────────── */
function PayPeriodsTab() {
  const TH = ({ ch }: { ch: string }) => (
    <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', whiteSpace: 'nowrap' }}>{ch}</th>
  )
  return (
    <div>
      <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: 'rgba(99,102,241,0.05)' }}>
            <tr>
              {['Period #','Start Date','End Date','Pay Date','Status','Employees','Gross Pay','Taxes','Net Pay'].map(h => <TH key={h} ch={h} />)}
            </tr>
          </thead>
          <tbody>
            {PAY_PERIODS.map((p, i) => {
              const s = STATUS_STYLE[p.status]
              const isNet = p.net !== '—'
              return (
                <tr key={p.num} style={{ borderTop: '1px solid rgba(99,102,241,0.08)', background: i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                  <td style={{ padding: '10px 14px', color: '#a5b4fc', fontWeight: 600, fontFamily: 'monospace' }}>{p.num}</td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{p.start}, 2026</td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{p.end}, 2026</td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{p.payDate}, 2026</td>
                  <td style={{ padding: '10px 14px' }}><Chip text={p.status} bg={s.bg} color={s.color} /></td>
                  <td style={{ padding: '10px 14px', color: '#e2e8f0' }}>{p.employees}</td>
                  <td style={{ padding: '10px 14px', color: isNet ? '#e2e8f0' : '#475569' }}>{p.gross}</td>
                  <td style={{ padding: '10px 14px', color: isNet ? '#fbbf24' : '#475569' }}>{p.taxes}</td>
                  <td style={{ padding: '10px 14px', color: isNet ? '#4ade80' : '#475569', fontWeight: isNet ? 600 : 400 }}>{p.net}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 16 }}>
        <button style={{ padding: '8px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer' }}>
          Configure Next Period
        </button>
      </div>
    </div>
  )
}

function PayCodesTab() {
  const TH = ({ ch }: { ch: string }) => (
    <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', whiteSpace: 'nowrap' }}>{ch}</th>
  )
  return (
    <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead style={{ background: 'rgba(99,102,241,0.05)' }}>
          <tr>
            {['Code','Description','Type','Tax Treatment','GL Account','Active'].map(h => <TH key={h} ch={h} />)}
          </tr>
        </thead>
        <tbody>
          {PAY_CODES.map((c, i) => {
            const tb = TYPE_BADGE[c.type] ?? { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' }
            return (
              <tr key={c.code} style={{ borderTop: '1px solid rgba(99,102,241,0.08)', background: i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                <td style={{ padding: '10px 14px', color: '#a5b4fc', fontWeight: 700, fontFamily: 'monospace' }}>{c.code}</td>
                <td style={{ padding: '10px 14px', color: '#e2e8f0' }}>{c.description}</td>
                <td style={{ padding: '10px 14px' }}><Chip text={c.type} bg={tb.bg} color={tb.color} /></td>
                <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{c.taxTreatment}</td>
                <td style={{ padding: '10px 14px', color: '#94a3b8', fontFamily: 'monospace' }}>{c.glAccount}</td>
                <td style={{ padding: '10px 14px' }}>
                  {c.active
                    ? <span style={{ color: '#4ade80', fontSize: 16 }}>✓</span>
                    : <span style={{ color: '#f87171', fontSize: 14 }}>✗</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function DeductionsTab() {
  const plans = [
    { name:'Medical Plan',  amount:'$450.00',  freq:'per month',  notes:'Employee + dependent coverage' },
    { name:'Dental',        amount:'$48.00',   freq:'per month',  notes:'Preventive + basic' },
    { name:'Vision',        amount:'$18.00',   freq:'per month',  notes:'Annual exam + lenses' },
    { name:'401(k)',        amount:'Up to 6%', freq:'match',      notes:'Company matches 100% up to 6%' },
    { name:'FSA',          amount:'$2,750',   freq:'per year',   notes:'Medical flexible spending max' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '14px 18px', background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 12, color: '#93c5fd' }}>
        Standard deductions are applied automatically each pay period. Employees may adjust elections during open enrollment or qualifying life events.
      </div>
      <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: 'rgba(99,102,241,0.05)' }}>
            <tr>
              {['Plan Name','Amount','Frequency','Notes',''].map((h, i) => (
                <th key={i} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map((p, i) => (
              <tr key={p.name} style={{ borderTop: '1px solid rgba(99,102,241,0.08)', background: i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                <td style={{ padding: '10px 14px', color: '#e2e8f0', fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: '10px 14px', color: '#a5b4fc', fontWeight: 700 }}>{p.amount}</td>
                <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{p.freq}</td>
                <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 12 }}>{p.notes}</td>
                <td style={{ padding: '10px 14px' }}>
                  <button style={{ fontSize: 11, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer' }}>+ Add Deduction Plan</button>
      </div>
    </div>
  )
}

function TaxSettingsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Federal */}
      <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '20px 24px' }}>
        <SectionLabel>Federal Tax Settings</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <FieldRow label="Filing Status Default">
            <select style={selectStyle}>
              <option>Single</option>
              <option>Married Filing Jointly</option>
              <option>Married Filing Separately</option>
              <option>Head of Household</option>
            </select>
          </FieldRow>
          <FieldRow label="W-4 Version">
            <select style={selectStyle}>
              <option>2020+ (New Form)</option>
              <option>Pre-2020 (Old Form)</option>
            </select>
          </FieldRow>
          <FieldRow label="Supplemental Rate">
            <input style={inputStyle} defaultValue="22%" />
          </FieldRow>
          <FieldRow label="Federal Unemployment (FUTA)">
            <input style={inputStyle} defaultValue="0.6%" readOnly />
          </FieldRow>
          <FieldRow label="FUTA Wage Base">
            <input style={inputStyle} defaultValue="$7,000" readOnly />
          </FieldRow>
          <FieldRow label="Additional Federal Withholding">
            <input style={inputStyle} defaultValue="$0.00" />
          </FieldRow>
        </div>
      </div>

      {/* State */}
      <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '20px 24px' }}>
        <SectionLabel>State Tax Settings — Illinois</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <FieldRow label="State">
            <select style={selectStyle}>
              <option>Illinois (IL)</option>
              <option>Indiana (IN)</option>
              <option>Wisconsin (WI)</option>
            </select>
          </FieldRow>
          <FieldRow label="State Income Tax Rate">
            <input style={inputStyle} defaultValue="4.95%" readOnly />
          </FieldRow>
          <FieldRow label="State Unemployment (SUI)">
            <input style={inputStyle} defaultValue="3.175%" />
          </FieldRow>
          <FieldRow label="SUI Wage Base">
            <input style={inputStyle} defaultValue="$13,271" readOnly />
          </FieldRow>
          <FieldRow label="Local Tax">
            <input style={inputStyle} defaultValue="None" />
          </FieldRow>
          <FieldRow label="Reciprocity States">
            <input style={inputStyle} defaultValue="Iowa, Kentucky, Michigan, Wisconsin" readOnly />
          </FieldRow>
        </div>
      </div>

      {/* FICA */}
      <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '20px 24px' }}>
        <SectionLabel>FICA — Social Security & Medicare</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <FieldRow label="SS Employee Rate">
            <input style={inputStyle} defaultValue="6.2%" readOnly />
          </FieldRow>
          <FieldRow label="SS Employer Rate">
            <input style={inputStyle} defaultValue="6.2%" readOnly />
          </FieldRow>
          <FieldRow label="SS Wage Base (2026)">
            <input style={inputStyle} defaultValue="$176,100" readOnly />
          </FieldRow>
          <FieldRow label="Medicare Employee Rate">
            <input style={inputStyle} defaultValue="1.45%" readOnly />
          </FieldRow>
          <FieldRow label="Medicare Employer Rate">
            <input style={inputStyle} defaultValue="1.45%" readOnly />
          </FieldRow>
          <FieldRow label="Additional Medicare (>$200k)">
            <input style={inputStyle} defaultValue="0.9%" readOnly />
          </FieldRow>
        </div>
      </div>
    </div>
  )
}

function DirectDepositTab() {
  const accounts = [
    { bank:'Chase Bank', routing:'021000021', last4:'4821', type:'Checking', pct:'100%', primary:true },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '16px 18px', background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8 }}>
        <div><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Enrolled Employees</div><div style={{ fontSize: 22, fontWeight: 700, color: '#4ade80' }}>48</div><div style={{ fontSize: 11, color: '#64748b' }}>of 52 (92.3%)</div></div>
        <div><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Paper Check</div><div style={{ fontSize: 22, fontWeight: 700, color: '#fbbf24' }}>4</div><div style={{ fontSize: 11, color: '#64748b' }}>employees</div></div>
        <div><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>NACHA File</div><div style={{ fontSize: 22, fontWeight: 700, color: '#a5b4fc' }}>Next: May 3</div><div style={{ fontSize: 11, color: '#64748b' }}>Submit 2 days prior</div></div>
      </div>
      <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '16px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Company Bank Account (Originator)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[['Bank Name','First National Bank of Chicago'],['Routing Number','071000013'],['Account (Last 4)','****9204'],['Account Type','Checking'],['NACHA Company Name','NOVAPOS LLC'],['NACHA Company ID','1234567890']].map(([l,v]) => (
            <div key={l}><div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{l}</div><div style={{ fontSize: 13, color: '#e2e8f0' }}>{v}</div></div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', cursor: 'pointer' }}>Generate NACHA File</button>
        <button style={{ padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer' }}>Direct Deposit Enrollment Report</button>
      </div>
    </div>
  )
}

function EarningCodesTab() {
  const codes = [
    { code:'REG',   desc:'Regular Hours',        rate:'Base Rate',   accrues:true,  taxable:true  },
    { code:'OT15',  desc:'Overtime 1.5x',         rate:'1.5× Base',   accrues:false, taxable:true  },
    { code:'OT2',   desc:'Overtime 2.0x',         rate:'2.0× Base',   accrues:false, taxable:true  },
    { code:'HOL',   desc:'Holiday Pay',           rate:'1.5× Base',   accrues:false, taxable:true  },
    { code:'VACA',  desc:'Vacation Payout',       rate:'Base Rate',   accrues:false, taxable:true  },
    { code:'SICK',  desc:'Sick Pay',              rate:'Base Rate',   accrues:false, taxable:true  },
    { code:'PTO',   desc:'PTO Payout',            rate:'Base Rate',   accrues:false, taxable:true  },
    { code:'BONUS', desc:'Discretionary Bonus',   rate:'Flat',        accrues:false, taxable:true  },
    { code:'PERF',  desc:'Performance Bonus',     rate:'Flat',        accrues:false, taxable:true  },
    { code:'SHIFT', desc:'Shift Differential',    rate:'+$3.00/hr',   accrues:true,  taxable:true  },
    { code:'CELL',  desc:'Cell Phone Allowance',  rate:'Flat $75',    accrues:false, taxable:false },
    { code:'MILES', desc:'Mileage Reimbursement', rate:'IRS Rate',    accrues:false, taxable:false },
  ]
  const TH = ({ ch }: { ch: string }) => (
    <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', whiteSpace: 'nowrap' }}>{ch}</th>
  )
  return (
    <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead style={{ background: 'rgba(99,102,241,0.05)' }}>
          <tr>{['Code','Description','Rate Method','Accrues Benefits','Taxable',''].map(h => <TH key={h} ch={h} />)}</tr>
        </thead>
        <tbody>
          {codes.map((c, i) => (
            <tr key={c.code} style={{ borderTop: '1px solid rgba(99,102,241,0.08)', background: i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
              <td style={{ padding: '10px 14px', color: '#a5b4fc', fontWeight: 700, fontFamily: 'monospace' }}>{c.code}</td>
              <td style={{ padding: '10px 14px', color: '#e2e8f0' }}>{c.desc}</td>
              <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{c.rate}</td>
              <td style={{ padding: '10px 14px' }}>{c.accrues ? <span style={{ color:'#4ade80' }}>Yes</span> : <span style={{ color:'#64748b' }}>No</span>}</td>
              <td style={{ padding: '10px 14px' }}>{c.taxable ? <span style={{ color:'#fbbf24' }}>Yes</span> : <span style={{ color:'#4ade80' }}>No</span>}</td>
              <td style={{ padding: '10px 14px' }}><button style={{ fontSize: 11, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── main page ──────────────────────────────────────────────────── */
export default function PayrollConfigurationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Pay Periods')

  useEffect(() => {
    fetch('/api/hr/payroll/configuration').then(r => r.json()).catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Payroll Configuration"
        breadcrumb={[
          { label: 'Human Resources', href: '/hr' },
          { label: 'Payroll', href: '/hr/payroll' },
          { label: 'Configuration', href: '/hr/payroll/configuration' },
        ]}
        actions={
          <button style={{ padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Save
          </button>
        }
      />

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Tab strip */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid rgba(99,102,241,0.15)', paddingBottom: 0 }}>
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
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'Pay Periods'    && <PayPeriodsTab />}
          {activeTab === 'Pay Codes'      && <PayCodesTab />}
          {activeTab === 'Deductions'     && <DeductionsTab />}
          {activeTab === 'Tax Settings'   && <TaxSettingsTab />}
          {activeTab === 'Direct Deposit' && <DirectDepositTab />}
          {activeTab === 'Earning Codes'  && <EarningCodesTab />}
        </div>
      </div>
    </div>
  )
}
