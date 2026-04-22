'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ── types ────────────────────────────────────────────────────────────────────
type TabId = 'codes' | 'groups' | 'jurisdictions' | 'exemptions' | 'audit'

interface TaxCode {
  code: string
  description: string
  taxType: string
  rate: number
  authority: string
  effectiveFrom: string
  effectiveTo: string
  active: boolean
}

interface TaxGroup {
  group: string
  description: string
  codes: string[]
  effectiveRate: number
  states: string
}

interface Jurisdiction {
  zipFrom: string
  zipTo: string
  state: string
  county: string
  city: string
  taxGroup: string
  rate: number
}

interface Exemption {
  entity: string
  certificate: string
  type: string
  issuedBy: string
  validFrom: string
  validTo: string
  status: 'Active' | 'Expired' | 'Pending'
  approvedBy: string
}

interface AuditEntry {
  date: string
  txRef: string
  customer: string
  subtotal: number
  taxCode: string
  rate: number
  taxAmount: number
  total: number
}

// ── static seed ──────────────────────────────────────────────────────────────
const TAX_CODES: TaxCode[] = [
  { code:'SALES_TAX_IL', description:'Illinois Sales Tax',  taxType:'Sales',   rate:6.25, authority:'IL Dept Revenue',  effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'COOK_CO_TAX',  description:'Cook County Tax',      taxType:'Sales',   rate:1.75, authority:'Cook County',       effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'CHICAGO_CITY', description:'Chicago City Tax',     taxType:'Sales',   rate:0.25, authority:'Chicago City',      effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'NY_STATE_TAX', description:'New York State',       taxType:'Sales',   rate:4.00, authority:'NY Dept Tax',       effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'NY_CITY_TAX',  description:'New York City',        taxType:'Sales',   rate:4.50, authority:'NYC Dept Finance',  effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'IL_FOOD_TAX',  description:'Illinois Food Tax',    taxType:'Reduced', rate:1.00, authority:'IL Dept Revenue',   effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'USE_TAX_IL',   description:'Illinois Use Tax',     taxType:'Use',     rate:6.25, authority:'IL Dept Revenue',   effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'EXEMPT',       description:'Tax Exempt',           taxType:'Exempt',  rate:0.00, authority:'N/A',               effectiveFrom:'Jan 1, 2020', effectiveTo:'—',             active:true  },
  { code:'CA_STATE_TAX', description:'California State Tax', taxType:'Sales',   rate:7.25, authority:'CA Dept Tax',       effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'LA_COUNTY_TAX',description:'Los Angeles County',   taxType:'Sales',   rate:2.25, authority:'LA County',         effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'TX_STATE_TAX', description:'Texas State Tax',      taxType:'Sales',   rate:6.25, authority:'TX Comptroller',    effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'TX_LOCAL_TAX', description:'Texas Local Tax',      taxType:'Sales',   rate:2.00, authority:'TX City',           effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'FL_STATE_TAX', description:'Florida State Tax',    taxType:'Sales',   rate:6.00, authority:'FL Dept Revenue',   effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'FL_COUNTY_TAX',description:'Florida County Tax',   taxType:'Sales',   rate:1.00, authority:'FL County',         effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'WA_STATE_TAX', description:'Washington State Tax', taxType:'Sales',   rate:6.50, authority:'WA Dept Revenue',   effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:false },
]

const TAX_GROUPS: TaxGroup[] = [
  { group:'CHICAGO_METRO', description:'Chicago Metropolitan',   codes:['SALES_TAX_IL','COOK_CO_TAX','CHICAGO_CITY'], effectiveRate:8.25, states:'IL' },
  { group:'NEW_YORK_CITY',  description:'New York City',          codes:['NY_STATE_TAX','NY_CITY_TAX'],                effectiveRate:8.50, states:'NY' },
  { group:'STANDARD',       description:'Standard (default)',     codes:['SALES_TAX_IL'],                              effectiveRate:6.25, states:'IL' },
  { group:'FOOD_REDUCED',   description:'Food Items',             codes:['IL_FOOD_TAX'],                               effectiveRate:1.00, states:'IL' },
  { group:'CALIFORNIA',     description:'California Standard',    codes:['CA_STATE_TAX','LA_COUNTY_TAX'],              effectiveRate:9.50, states:'CA' },
  { group:'TEXAS_STD',      description:'Texas Standard',         codes:['TX_STATE_TAX','TX_LOCAL_TAX'],               effectiveRate:8.25, states:'TX' },
]

const JURISDICTIONS: Jurisdiction[] = [
  { zipFrom:'60601', zipTo:'60699', state:'IL', county:'Cook',     city:'Chicago',  taxGroup:'CHICAGO_METRO', rate:8.25 },
  { zipFrom:'60700', zipTo:'60799', state:'IL', county:'Cook',     city:'Suburbs',  taxGroup:'COOK_COUNTY',   rate:8.00 },
  { zipFrom:'10001', zipTo:'10299', state:'NY', county:'New York', city:'NYC',      taxGroup:'NEW_YORK_CITY', rate:8.50 },
  { zipFrom:'10300', zipTo:'10499', state:'NY', county:'Westchester',city:'Yonkers',taxGroup:'NY_STATE',      rate:4.00 },
  { zipFrom:'90001', zipTo:'90899', state:'CA', county:'LA',       city:'Los Angeles',taxGroup:'CALIFORNIA',  rate:9.50 },
  { zipFrom:'77001', zipTo:'77299', state:'TX', county:'Harris',   city:'Houston',  taxGroup:'TEXAS_STD',     rate:8.25 },
  { zipFrom:'75201', zipTo:'75399', state:'TX', county:'Dallas',   city:'Dallas',   taxGroup:'TEXAS_STD',     rate:8.25 },
  { zipFrom:'33101', zipTo:'33299', state:'FL', county:'Miami-Dade',city:'Miami',   taxGroup:'FL_STANDARD',   rate:7.00 },
  { zipFrom:'32099', zipTo:'32299', state:'FL', county:'Duval',    city:'Jacksonville',taxGroup:'FL_STANDARD',rate:7.00 },
  { zipFrom:'98101', zipTo:'98199', state:'WA', county:'King',     city:'Seattle',  taxGroup:'WA_STANDARD',   rate:6.50 },
]

const EXEMPTIONS: Exemption[] = [
  { entity:'The Cannon Group PLC',    certificate:'IL-EX-2024-0291', type:'Resale',    issuedBy:'IL Dept Revenue', validFrom:'Jan 1, 2024', validTo:'Dec 31, 2026', status:'Active',  approvedBy:'Alice Chen' },
  { entity:'Adatum Corp',             certificate:'NY-EX-2023-1847', type:'Non-Profit',issuedBy:'NY Dept Tax',     validFrom:'Jan 1, 2023', validTo:'Dec 31, 2025', status:'Expired', approvedBy:'Alice Chen' },
  { entity:'Contoso Ltd',             certificate:'IL-EX-2025-0482', type:'Government',issuedBy:'IL Dept Revenue', validFrom:'Jan 1, 2025', validTo:'Dec 31, 2027', status:'Active',  approvedBy:'Bob Torres' },
  { entity:'Fabrikam Inc',            certificate:'TX-EX-2024-0831', type:'Resale',    issuedBy:'TX Comptroller',  validFrom:'Jun 1, 2024', validTo:'May 31, 2027', status:'Active',  approvedBy:'Alice Chen' },
  { entity:'Northwind Traders',       certificate:'CA-EX-2024-1203', type:'Resale',    issuedBy:'CA Dept Tax',     validFrom:'Jan 1, 2024', validTo:'Dec 31, 2026', status:'Active',  approvedBy:'Carol Wang' },
  { entity:'Proseware Inc',           certificate:'FL-EX-2023-0509', type:'Non-Profit',issuedBy:'FL Dept Revenue', validFrom:'Mar 1, 2023', validTo:'Feb 28, 2026', status:'Active',  approvedBy:'Bob Torres' },
  { entity:'Trey Research',           certificate:'WA-EX-2022-0174', type:'Government',issuedBy:'WA Dept Revenue', validFrom:'Jan 1, 2022', validTo:'Dec 31, 2024', status:'Expired', approvedBy:'Alice Chen' },
  { entity:'Wide World Importers',    certificate:'IL-EX-2025-1093', type:'Resale',    issuedBy:'IL Dept Revenue', validFrom:'Jan 1, 2025', validTo:'Dec 31, 2027', status:'Active',  approvedBy:'Carol Wang' },
]

const AUDIT_ENTRIES: AuditEntry[] = [
  { date:'Apr 22, 2026', txRef:'SO-2026-04221', customer:'Adatum Corp',           subtotal:4800.00,  taxCode:'EXEMPT',        rate:0.00, taxAmount:0.00,   total:4800.00  },
  { date:'Apr 22, 2026', txRef:'SO-2026-04220', customer:'Fabrikam Inc',          subtotal:12400.00, taxCode:'CHICAGO_METRO', rate:8.25, taxAmount:1023.00,total:13423.00 },
  { date:'Apr 21, 2026', txRef:'SO-2026-04219', customer:'Northwind Traders',     subtotal:8750.00,  taxCode:'CALIFORNIA',    rate:9.50, taxAmount:831.25, total:9581.25  },
  { date:'Apr 21, 2026', txRef:'SO-2026-04218', customer:'Contoso Ltd',           subtotal:22000.00, taxCode:'EXEMPT',        rate:0.00, taxAmount:0.00,   total:22000.00 },
  { date:'Apr 20, 2026', txRef:'SO-2026-04217', customer:'Wide World Importers',  subtotal:5600.00,  taxCode:'STANDARD',      rate:6.25, taxAmount:350.00, total:5950.00  },
  { date:'Apr 20, 2026', txRef:'SO-2026-04216', customer:'Proseware Inc',         subtotal:1200.00,  taxCode:'FOOD_REDUCED',  rate:1.00, taxAmount:12.00,  total:1212.00  },
  { date:'Apr 19, 2026', txRef:'SO-2026-04215', customer:'Trey Research',         subtotal:9400.00,  taxCode:'CHICAGO_METRO', rate:8.25, taxAmount:775.50, total:10175.50 },
  { date:'Apr 18, 2026', txRef:'SO-2026-04214', customer:'The Cannon Group PLC',  subtotal:31000.00, taxCode:'EXEMPT',        rate:0.00, taxAmount:0.00,   total:31000.00 },
  { date:'Apr 17, 2026', txRef:'SO-2026-04213', customer:'Fabrikam Inc',          subtotal:7200.00,  taxCode:'TEXAS_STD',     rate:8.25, taxAmount:594.00, total:7794.00  },
  { date:'Apr 16, 2026', txRef:'SO-2026-04212', customer:'Adatum Corp',           subtotal:15800.00, taxCode:'NEW_YORK_CITY', rate:8.50, taxAmount:1343.00,total:17143.00 },
]

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtRate(r: number) { return r.toFixed(2) + '%' }
function fmtMoney(n: number) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

function showToast(msg: string) {
  const el = document.createElement('div')
  el.textContent = msg
  Object.assign(el.style, {
    position:'fixed', bottom:'28px', right:'28px', zIndex:9999,
    background:'#16213e', border:'1px solid rgba(99,102,241,0.4)', color:'#a5b4fc',
    padding:'10px 18px', borderRadius:'8px', fontSize:'12px', fontWeight:'600',
    boxShadow:'0 4px 24px rgba(0,0,0,0.4)',
  })
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2600)
}

// ── status chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: 'Active' | 'Expired' | 'Pending' | boolean }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    Active:  { bg:'rgba(52,211,153,0.12)',   color:'#34d399', label:'Active'  },
    Expired: { bg:'rgba(251,191,36,0.12)',   color:'#fbbf24', label:'Expired' },
    Pending: { bg:'rgba(148,163,184,0.12)',  color:'#94a3b8', label:'Pending' },
    true:    { bg:'rgba(52,211,153,0.12)',   color:'#34d399', label:'Active'  },
    false:   { bg:'rgba(148,163,184,0.12)',  color:'#94a3b8', label:'Inactive'},
  }
  const key = typeof status === 'boolean' ? String(status) : status
  const s = map[key] || map['Pending']
  return <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:s.bg, color:s.color, fontWeight:600 }}>{s.label}</span>
}

// ── tab styles ────────────────────────────────────────────────────────────────
function Tab({ id, label, active, onClick }: { id: TabId; label: string; active: boolean; onClick: (id: TabId) => void }) {
  return (
    <button onClick={() => onClick(id)} style={{
      padding:'8px 16px', fontSize:12, fontWeight: active ? 600 : 400,
      color: active ? '#a5b4fc' : '#94a3b8',
      background: 'none', border:'none', borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
      cursor:'pointer', whiteSpace:'nowrap', transition:'color 0.15s',
    }}>{label}</button>
  )
}

// ── ZIP modal ─────────────────────────────────────────────────────────────────
function AddJurisdictionModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.3)', borderRadius:12, padding:28, width:420, boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', marginBottom:20 }}>Add Jurisdiction Mapping</div>
        {[['ZIP Range From','60601'],['ZIP Range To','60699'],['State','IL'],['County','Cook'],['City','Chicago']].map(([label, ph]) => (
          <div key={label} style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:'#94a3b8', marginBottom:5 }}>{label}</div>
            <input placeholder={ph} style={{ width:'100%', padding:'7px 10px', borderRadius:6, background:'#0d0e24', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', fontSize:12, outline:'none', boxSizing:'border-box' }} />
          </div>
        ))}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, color:'#94a3b8', marginBottom:5 }}>Tax Group</div>
          <select style={{ width:'100%', padding:'7px 10px', borderRadius:6, background:'#0d0e24', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', fontSize:12, outline:'none' }}>
            {TAX_GROUPS.map(g => <option key={g.group}>{g.group} ({fmtRate(g.effectiveRate)})</option>)}
          </select>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => { showToast('Jurisdiction added'); onClose() }}
            style={{ flex:1, padding:'9px 0', borderRadius:6, fontSize:12, fontWeight:600, background:'rgba(99,102,241,0.8)', color:'#fff', border:'none', cursor:'pointer' }}>Save</button>
          <button onClick={onClose}
            style={{ flex:1, padding:'9px 0', borderRadius:6, fontSize:12, background:'transparent', color:'#94a3b8', border:'1px solid rgba(148,163,184,0.15)', cursor:'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── tab contents ──────────────────────────────────────────────────────────────
function CodesTab() {
  const thStyle = (right = false): React.CSSProperties => ({
    padding:'10px 14px', textAlign: right ? 'right' : 'left',
    fontSize:10, fontWeight:600, color:'#94a3b8',
    textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap'
  })
  const tdStyle = (right = false): React.CSSProperties => ({
    padding:'9px 14px', textAlign: right ? 'right' : 'left'
  })
  const TYPE_COLOR: Record<string, string> = {
    Sales:'#60a5fa', Reduced:'#34d399', Use:'#a78bfa', Exempt:'#94a3b8'
  }
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
        <thead style={{ position:'sticky', top:0, background:'#0d0e24', zIndex:1 }}>
          <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
            <th style={thStyle()}>Tax Code</th>
            <th style={thStyle()}>Description</th>
            <th style={thStyle()}>Tax Type</th>
            <th style={thStyle(true)}>Rate %</th>
            <th style={thStyle()}>Tax Authority</th>
            <th style={thStyle()}>Effective From</th>
            <th style={thStyle()}>Effective To</th>
            <th style={thStyle()}>Active</th>
          </tr>
        </thead>
        <tbody>
          {TAX_CODES.map(c => (
            <tr key={c.code} style={{ borderBottom:'1px solid rgba(99,102,241,0.06)', cursor:'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
              <td style={tdStyle()}><span style={{ fontFamily:'monospace', fontSize:11, color:'#a5b4fc' }}>{c.code}</span></td>
              <td style={{ ...tdStyle(), color:'#e2e8f0', fontWeight:500 }}>{c.description}</td>
              <td style={tdStyle()}>
                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20,
                  background:`${TYPE_COLOR[c.taxType] ?? '#94a3b8'}22`,
                  color: TYPE_COLOR[c.taxType] ?? '#94a3b8', fontWeight:600 }}>{c.taxType}</span>
              </td>
              <td style={{ ...tdStyle(true), fontVariantNumeric:'tabular-nums', fontWeight:600, color: c.rate === 0 ? '#94a3b8' : '#e2e8f0' }}>{fmtRate(c.rate)}</td>
              <td style={{ ...tdStyle(), color:'#94a3b8', fontSize:11 }}>{c.authority}</td>
              <td style={{ ...tdStyle(), color:'#94a3b8', fontSize:11 }}>{c.effectiveFrom}</td>
              <td style={{ ...tdStyle(), color:'#94a3b8', fontSize:11 }}>{c.effectiveTo}</td>
              <td style={tdStyle()}><StatusChip status={c.active} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GroupsTab() {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
        <thead style={{ position:'sticky', top:0, background:'#0d0e24', zIndex:1 }}>
          <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
            {['Group','Description','Tax Codes','Effective Rate','States'].map((h, i) => (
              <th key={h} style={{ padding:'10px 14px', textAlign: i === 3 ? 'right' : 'left', fontSize:10, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TAX_GROUPS.map(g => (
            <tr key={g.group} style={{ borderBottom:'1px solid rgba(99,102,241,0.06)', cursor:'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
              <td style={{ padding:'9px 14px' }}><span style={{ fontFamily:'monospace', fontSize:11, color:'#a5b4fc' }}>{g.group}</span></td>
              <td style={{ padding:'9px 14px', color:'#e2e8f0', fontWeight:500 }}>{g.description}</td>
              <td style={{ padding:'9px 14px' }}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {g.codes.map(c => (
                    <span key={c} style={{ fontSize:10, padding:'1px 6px', borderRadius:4, background:'rgba(99,102,241,0.15)', color:'#a5b4fc' }}>{c}</span>
                  ))}
                </div>
              </td>
              <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700, color:'#34d399' }}>{fmtRate(g.effectiveRate)}</td>
              <td style={{ padding:'9px 14px' }}>
                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:4, background:'rgba(148,163,184,0.1)', color:'#94a3b8' }}>{g.states}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function JurisdictionsTab() {
  const [showModal, setShowModal] = useState(false)
  return (
    <div>
      <div style={{ padding:'12px 0 12px 14px', display:'flex', justifyContent:'flex-end' }}>
        <button onClick={() => setShowModal(true)}
          style={{ padding:'6px 14px', borderRadius:6, fontSize:12, fontWeight:600, background:'rgba(99,102,241,0.8)', color:'#fff', border:'none', cursor:'pointer' }}>
          + Add Jurisdiction
        </button>
      </div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead style={{ position:'sticky', top:0, background:'#0d0e24', zIndex:1 }}>
            <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
              {['ZIP From','ZIP To','State','County','City','Tax Group','Rate'].map((h, i) => (
                <th key={h} style={{ padding:'10px 14px', textAlign: i === 6 ? 'right' : 'left', fontSize:10, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {JURISDICTIONS.map((j, i) => (
              <tr key={i} style={{ borderBottom:'1px solid rgba(99,102,241,0.06)', cursor:'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                <td style={{ padding:'9px 14px', fontFamily:'monospace', fontSize:11, color:'#94a3b8' }}>{j.zipFrom}</td>
                <td style={{ padding:'9px 14px', fontFamily:'monospace', fontSize:11, color:'#94a3b8' }}>{j.zipTo}</td>
                <td style={{ padding:'9px 14px' }}><span style={{ fontSize:11, padding:'2px 7px', borderRadius:4, background:'rgba(99,102,241,0.12)', color:'#a5b4fc' }}>{j.state}</span></td>
                <td style={{ padding:'9px 14px', color:'#94a3b8', fontSize:11 }}>{j.county}</td>
                <td style={{ padding:'9px 14px', color:'#e2e8f0', fontWeight:500 }}>{j.city}</td>
                <td style={{ padding:'9px 14px' }}><span style={{ fontFamily:'monospace', fontSize:11, color:'#a5b4fc' }}>{j.taxGroup}</span></td>
                <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700, color:'#34d399' }}>{fmtRate(j.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && <AddJurisdictionModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

function ExemptionsTab() {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
        <thead style={{ position:'sticky', top:0, background:'#0d0e24', zIndex:1 }}>
          <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
            {['Customer / Entity','Certificate #','Type','Issued By','Valid From','Valid To','Status','Approved By'].map(h => (
              <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {EXEMPTIONS.map(e => (
            <tr key={e.certificate} style={{ borderBottom:'1px solid rgba(99,102,241,0.06)', cursor:'pointer' }}
              onMouseEnter={ev => (ev.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={ev => (ev.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
              <td style={{ padding:'9px 14px', color:'#e2e8f0', fontWeight:500 }}>{e.entity}</td>
              <td style={{ padding:'9px 14px', fontFamily:'monospace', fontSize:10, color:'#a5b4fc' }}>{e.certificate}</td>
              <td style={{ padding:'9px 14px', color:'#94a3b8', fontSize:11 }}>{e.type}</td>
              <td style={{ padding:'9px 14px', color:'#94a3b8', fontSize:11 }}>{e.issuedBy}</td>
              <td style={{ padding:'9px 14px', color:'#94a3b8', fontSize:11 }}>{e.validFrom}</td>
              <td style={{ padding:'9px 14px', color:'#94a3b8', fontSize:11 }}>{e.validTo}</td>
              <td style={{ padding:'9px 14px' }}><StatusChip status={e.status} /></td>
              <td style={{ padding:'9px 14px', color:'#94a3b8', fontSize:11 }}>{e.approvedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AuditTab() {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
        <thead style={{ position:'sticky', top:0, background:'#0d0e24', zIndex:1 }}>
          <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
            {['Date','Tx Ref','Customer','Subtotal','Tax Code','Rate','Tax Amount','Total'].map((h, i) => (
              <th key={h} style={{ padding:'10px 14px', textAlign: i >= 3 ? 'right' : 'left', fontSize:10, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {AUDIT_ENTRIES.map((a, i) => (
            <tr key={i} style={{ borderBottom:'1px solid rgba(99,102,241,0.06)', cursor:'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
              <td style={{ padding:'9px 14px', color:'#94a3b8', whiteSpace:'nowrap' }}>{a.date}</td>
              <td style={{ padding:'9px 14px', fontFamily:'monospace', fontSize:10, color:'#a5b4fc' }}>{a.txRef}</td>
              <td style={{ padding:'9px 14px', color:'#e2e8f0', fontWeight:500 }}>{a.customer}</td>
              <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', color:'#e2e8f0' }}>{fmtMoney(a.subtotal)}</td>
              <td style={{ padding:'9px 14px', textAlign:'right' }}><span style={{ fontFamily:'monospace', fontSize:10, color:'#a5b4fc' }}>{a.taxCode}</span></td>
              <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', color:'#94a3b8' }}>{fmtRate(a.rate)}</td>
              <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', color: a.taxAmount === 0 ? '#94a3b8' : '#fb923c' }}>{fmtMoney(a.taxAmount)}</td>
              <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700, color:'#e2e8f0' }}>{fmtMoney(a.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function TaxManagementPage() {
  const [activeTab, setActiveTab] = useState<TabId>('codes')
  const [_loaded, setLoaded]      = useState(false)

  useEffect(() => {
    fetch('/api/finance/tax-management')
      .then(r => r.json())
      .catch(() => {/* use static seed */})
      .finally(() => setLoaded(true))
  }, [])

  const TABS: { id: TabId; label: string }[] = [
    { id:'codes',         label:'Tax Codes'       },
    { id:'groups',        label:'Tax Groups'      },
    { id:'jurisdictions', label:'Tax Jurisdictions'},
    { id:'exemptions',    label:'Exemptions'      },
    { id:'audit',         label:'Audit'           },
  ]

  return (
    <div style={{ minHeight:'100dvh', background:'#0d0e24', color:'#e2e8f0', display:'flex', flexDirection:'column' }}>
      <TopBar
        title="Tax Management"
        breadcrumb={[
          { label:'Finance', href:'/finance' },
          { label:'Tax Management', href:'/finance/tax-management' },
        ]}
        actions={
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ padding:'6px 14px', borderRadius:6, fontSize:12, fontWeight:600, background:'rgba(99,102,241,0.85)', color:'#fff', border:'none', cursor:'pointer' }}>New Tax Code</button>
            <button onClick={() => showToast('Import initiated')}
              style={{ padding:'6px 14px', borderRadius:6, fontSize:12, background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.25)', cursor:'pointer' }}>Import Rates</button>
            <button onClick={() => showToast('Validation passed — all rates current')}
              style={{ padding:'6px 14px', borderRadius:6, fontSize:12, background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.25)', cursor:'pointer' }}>Validate</button>
          </div>
        }
      />

      {/* tab strip */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(99,102,241,0.15)', padding:'0 24px', background:'#0d0e24', overflowX:'auto' }}>
        {TABS.map(t => <Tab key={t.id} id={t.id} label={t.label} active={activeTab === t.id} onClick={setActiveTab} />)}
      </div>

      {/* tab content */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 0 60px 0' }}>
        {activeTab === 'codes'         && <CodesTab />}
        {activeTab === 'groups'        && <GroupsTab />}
        {activeTab === 'jurisdictions' && <JurisdictionsTab />}
        {activeTab === 'exemptions'    && <ExemptionsTab />}
        {activeTab === 'audit'         && <AuditTab />}
      </div>
    </div>
  )
}
