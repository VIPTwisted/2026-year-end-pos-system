'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg:     '#0d0e24',
  card:   '#16213e',
  border: 'rgba(99,102,241,0.15)',
  accent: 'rgba(99,102,241,0.3)',
  text:   '#e2e8f0',
  muted:  '#94a3b8',
  indigo: '#6366f1',
}

const ENTITIES = ['USMF', 'USRT', 'DEMF', 'GBSI']

export default function CompanyInformationPage() {
  const [activeEntity, setActiveEntity] = useState('USMF')
  const [, setData] = useState<unknown>(null)

  useEffect(() => {
    fetch('/api/admin/company-information').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  return (
    <div style={{ minHeight:'100dvh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif' }}>
      <TopBar
        title="Company Information"
        breadcrumb={[
          { label:'Administration', href:'/admin' },
          { label:'Company Information', href:'/admin/company-information' },
        ]}
        actions={
          <>
            <button style={btnPrimary}>Save</button>
            <button style={btnSecondary}>Add Legal Entity</button>
          </>
        }
      />

      <div style={{ padding:'24px 28px' }}>
        {/* Legal Entity tab strip */}
        <div style={{ display:'flex', alignItems:'center', gap:2, marginBottom:24, borderBottom:`1px solid ${C.border}`, paddingBottom:0 }}>
          {ENTITIES.map(e => (
            <button
              key={e}
              onClick={() => setActiveEntity(e)}
              style={{
                background: activeEntity === e ? C.indigo : 'transparent',
                color: activeEntity === e ? '#fff' : C.muted,
                border: `1px solid ${activeEntity === e ? C.indigo : C.border}`,
                borderBottom: activeEntity === e ? `1px solid ${C.indigo}` : '1px solid transparent',
                borderRadius:'6px 6px 0 0', padding:'7px 20px', fontSize:13, fontWeight:600, cursor:'pointer',
                marginBottom:-1,
              }}
            >{e}</button>
          ))}
          <button style={{
            background:'transparent', color:C.muted, border:`1px dashed ${C.border}`,
            borderRadius:'6px 6px 0 0', padding:'7px 14px', fontSize:13, cursor:'pointer',
            marginBottom:-1, marginLeft:4,
          }}>+ New</button>
        </div>

        {activeEntity === 'USMF' && (
          <div style={{ display:'grid', gap:16, maxWidth:960 }}>

            {/* General */}
            <details open style={card}>
              <summary style={summaryStyle}>General</summary>
              <div style={{ padding:'16px 0 4px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 32px' }}>
                <Field label="Company ID"          value="USMF" />
                <Field label="Company Name"         value="NovaPOS Demo Co. (US Manufacturing)" />
                <Field label="Legal Name"           value="NovaPOS Holdings LLC" />
                <Field label="Tax ID / EIN"         value="12-3456789" />
                <Field label="VAT Registration"     value="N/A" />
                <Field label="Phone"                value="+1 312 555 0100" />
                <Field label="Fax"                  value="+1 312 555 0101" />
                <Field label="Email"                value="info@novapos.local" />
                <Field label="Website"              value="https://novapos.local" />
                <Field label="DUNS Number"          value="04-123-4567" />
              </div>
            </details>

            {/* Address */}
            <details open style={card}>
              <summary style={summaryStyle}>Address</summary>
              <div style={{ padding:'16px 0 4px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 32px' }}>
                <Field label="Street"       value="123 Innovation Drive" />
                <Field label="Suite"        value="Suite 400" />
                <Field label="City"         value="Chicago" />
                <Field label="State"        value="IL" />
                <Field label="ZIP"          value="60601" />
                <Field label="Country"      value="United States" />
                <Field label="Time Zone"    value="(UTC-06:00) Central Time (US & Canada)" fullWidth />
              </div>
            </details>

            {/* Fiscal Year */}
            <details style={card}>
              <summary style={summaryStyle}>Fiscal Year</summary>
              <div style={{ padding:'16px 0 4px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 32px' }}>
                <Field label="Fiscal Year"          value="Calendar Year (Jan 1 – Dec 31)" />
                <Field label="Current Period"        value="April 2026" />
                <Field label="Accounting Currency"   value="USD" />
                <Field label="Reporting Currency"    value="USD" />
                <Field label="Exchange Rate Type"    value="Average" />
              </div>
            </details>

            {/* Bank Account */}
            <details style={card}>
              <summary style={summaryStyle}>Bank Account</summary>
              <div style={{ padding:'16px 0 4px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 32px' }}>
                <Field label="Default Bank Account"  value="JPMorgan Chase Checking-001" />
                <Field label="Routing Number"        value="021000021" />
                <Field label="Account Number"        value="****7890" />
              </div>
            </details>

            {/* Logos & Branding */}
            <details style={card}>
              <summary style={summaryStyle}>Logos &amp; Branding</summary>
              <div style={{ padding:'16px 0 4px', display:'grid', gap:20 }}>
                {/* Logo upload */}
                <div>
                  <div style={labelStyle}>Company Logo</div>
                  <div style={{
                    border:`2px dashed ${C.border}`, borderRadius:8, width:220, height:72,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:'rgba(255,255,255,0.02)', color:C.muted, fontSize:12, cursor:'pointer',
                  }}>
                    Upload Logo 200×60px
                  </div>
                </div>
                {/* Text fields */}
                <TextAreaField label="Receipt Header"  value={`NovaPOS Demo Co.\n123 Innovation Drive Chicago IL 60601`} />
                <TextAreaField label="Receipt Footer"  value="Thank you for your business! Returns within 30 days." />
                <TextAreaField label="Invoice Header"  value={`NovaPOS Demo Co.\n123 Innovation Drive Chicago IL 60601`} />
              </div>
            </details>

          </div>
        )}

        {activeEntity !== 'USMF' && (
          <div style={{ ...card, color:C.muted, fontSize:14, padding:32, textAlign:'center' }}>
            Select the USMF entity to view company information.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Field({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <div style={labelStyle}>{label}</div>
      <input
        readOnly
        defaultValue={value}
        style={{
          width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(99,102,241,0.2)',
          borderRadius:6, padding:'7px 12px', color:'#e2e8f0', fontSize:13,
          outline:'none', boxSizing:'border-box',
        }}
      />
    </div>
  )
}

function TextAreaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <textarea
        readOnly
        defaultValue={value}
        rows={3}
        style={{
          width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(99,102,241,0.2)',
          borderRadius:6, padding:'7px 12px', color:'#e2e8f0', fontSize:13,
          outline:'none', resize:'vertical', fontFamily:'system-ui,sans-serif', boxSizing:'border-box',
        }}
      />
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: '#16213e',
  border: '1px solid rgba(99,102,241,0.15)',
  borderRadius: 8,
  padding: '0 16px 16px',
}
const summaryStyle: React.CSSProperties = {
  cursor:'pointer', fontWeight:700, fontSize:13, color:'#e2e8f0',
  padding:'14px 0', listStyle:'none', display:'flex', alignItems:'center', gap:8,
}
const labelStyle: React.CSSProperties = {
  fontSize:11, color:'#94a3b8', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600,
}
const btnPrimary: React.CSSProperties = {
  background:'#6366f1', color:'#fff', border:'none', borderRadius:6,
  padding:'7px 14px', fontSize:13, fontWeight:600, cursor:'pointer',
}
const btnSecondary: React.CSSProperties = {
  background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)',
  borderRadius:6, padding:'7px 14px', fontSize:13, fontWeight:500, cursor:'pointer',
}
