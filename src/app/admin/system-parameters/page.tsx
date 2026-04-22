'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────
interface SystemParams {
  general:     { companyName: string; legalName: string; taxRegistration: string; primaryCurrency: string; fiscalYearStart: string; timeZone: string }
  behavior:    { auditLogging: boolean; approvalThreshold: number; electronicSignatures: boolean; maintenanceMode: boolean; defaultLanguage: string; dateFormat: string; numberFormat: string }
  security:    { passwordMinLength: number; sessionTimeout: number; maxFailedLogins: number; mfaEnabled: boolean; ipWhitelist: string }
  integration: { apiEndpoint: string; webhookUrl: string; apiKey: string }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const S = {
  bg: '#0d0e24', card: '#16213e', border: 'rgba(99,102,241,0.15)',
  text: '#e2e8f0', muted: '#94a3b8', indigo: '#6366f1',
}

const LEFT_TABS = ['General', 'Number Sequences', 'Fiscal Calendar', 'Units of Measure', 'Address Setup', 'Languages', 'Email Settings', 'Integrations']

// ─── Toggle ────────────────────────────────────────────────────────────────
function Toggle({ value, onChange, danger }: { value: boolean; onChange: (v: boolean) => void; danger?: boolean }) {
  const activeColor = danger ? '#ef4444' : S.indigo
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', position: 'relative',
        background: value ? activeColor : 'rgba(148,163,184,0.2)', transition: 'background .2s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16,
        borderRadius: 8, background: '#fff', transition: 'left .2s', display: 'block',
      }} />
    </button>
  )
}

// ─── FastTab ───────────────────────────────────────────────────────────────
function FastTab({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} style={{ marginBottom: 12, borderRadius: 8, border: `1px solid ${S.border}`, overflow: 'hidden' }}>
      <summary style={{
        padding: '11px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 12,
        color: S.text, background: 'rgba(99,102,241,0.07)', userSelect: 'none',
        listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>{title}</span>
        <span style={{ fontSize: 10, color: S.muted }}>▾</span>
      </summary>
      <div style={{ padding: '14px 16px', background: S.card }}>
        {children}
      </div>
    </details>
  )
}

// ─── FormRow ───────────────────────────────────────────────────────────────
function FormRow({ label, children, muted }: { label: string; children: React.ReactNode; muted?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 12, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
      <div>
        <span style={{ fontSize: 12, color: S.muted }}>{label}</span>
        {muted && <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.6)', marginTop: 1 }}>{muted}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SystemParametersPage() {
  const [params, setParams]     = useState<SystemParams | null>(null)
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('General')
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    fetch('/api/admin/system-parameters')
      .then(r => r.json())
      .then(d => { setParams(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const update = (section: keyof SystemParams, key: string, val: unknown) => {
    setParams(prev => prev ? { ...prev, [section]: { ...prev[section], [key]: val } } : prev)
  }

  const inputStyle: React.CSSProperties = {
    padding: '5px 10px', fontSize: 12, borderRadius: 6, border: `1px solid ${S.border}`,
    background: '#0d0e24', color: S.text, outline: 'none', width: '100%',
  }
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

  return (
    <div style={{ minHeight: '100dvh', background: S.bg, display: 'flex', flexDirection: 'column' }}>
      <TopBar
        title="System Parameters"
        breadcrumb={[
          { label: 'Administration', href: '/admin' },
          { label: 'System Parameters', href: '/admin/system-parameters' },
        ]}
        actions={
          <>
            <button style={btnPrimary}>Save</button>
            <button style={btnSecondary}>Reset to Defaults</button>
          </>
        }
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left tab nav */}
        <nav style={{ width: 200, background: S.card, borderRight: `1px solid ${S.border}`, flexShrink: 0, padding: '12px 0' }}>
          {LEFT_TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '9px 18px',
                fontSize: 13, fontWeight: activeTab === t ? 600 : 400, cursor: 'pointer',
                background: activeTab === t ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: activeTab === t ? S.indigo : S.muted,
                border: 'none', borderLeft: activeTab === t ? `3px solid ${S.indigo}` : '3px solid transparent',
                transition: 'all .15s',
              }}
            >{t}</button>
          ))}
        </nav>

        {/* Right content */}
        <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          {loading || !params ? (
            <div style={{ color: S.muted, fontSize: 14 }}>Loading parameters...</div>
          ) : activeTab !== 'General' ? (
            <div style={{ color: S.muted, fontSize: 14, paddingTop: 40, textAlign: 'center' }}>
              {activeTab} settings — content loaded dynamically.
            </div>
          ) : (
            <>
              {/* Company Information */}
              <FastTab title="Company Information" defaultOpen>
                <FormRow label="Company Name">
                  <input value={params.general.companyName} onChange={e => update('general','companyName',e.target.value)} style={inputStyle} />
                </FormRow>
                <FormRow label="Legal Name">
                  <input value={params.general.legalName} onChange={e => update('general','legalName',e.target.value)} style={inputStyle} />
                </FormRow>
                <FormRow label="Tax Registration">
                  <input value={params.general.taxRegistration} onChange={e => update('general','taxRegistration',e.target.value)} style={inputStyle} />
                </FormRow>
                <FormRow label="Primary Currency">
                  <select value={params.general.primaryCurrency} onChange={e => update('general','primaryCurrency',e.target.value)} style={selectStyle}>
                    {['USD','EUR','GBP','CAD','AUD','CHF'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </FormRow>
                <FormRow label="Fiscal Year Start">
                  <select value={params.general.fiscalYearStart} onChange={e => update('general','fiscalYearStart',e.target.value)} style={selectStyle}>
                    {['January 1','April 1','July 1','October 1'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </FormRow>
                <FormRow label="Time Zone">
                  <select value={params.general.timeZone} onChange={e => update('general','timeZone',e.target.value)} style={selectStyle}>
                    {['(UTC-08:00) Pacific Time','(UTC-07:00) Mountain Time','(UTC-06:00) Central Time','(UTC-05:00) Eastern Time'].map(tz => <option key={tz}>{tz}</option>)}
                  </select>
                </FormRow>
              </FastTab>

              {/* System Behavior */}
              <FastTab title="System Behavior" defaultOpen>
                <FormRow label="Enable audit logging">
                  <Toggle value={params.behavior.auditLogging} onChange={v => update('behavior','auditLogging',v)} />
                </FormRow>
                <FormRow label="Require approval for amounts over" muted="Applies to PO, expense, and journal entries">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: S.muted, fontSize: 12 }}>$</span>
                    <input
                      type="number"
                      value={params.behavior.approvalThreshold}
                      onChange={e => update('behavior','approvalThreshold',Number(e.target.value))}
                      style={{ ...inputStyle, width: 100 }}
                    />
                  </div>
                </FormRow>
                <FormRow label="Enable electronic signatures">
                  <Toggle value={params.behavior.electronicSignatures} onChange={v => update('behavior','electronicSignatures',v)} />
                </FormRow>
                <FormRow label="Maintenance mode" muted="Locks all users out except System Admin">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Toggle value={params.behavior.maintenanceMode} onChange={v => update('behavior','maintenanceMode',v)} danger />
                    {params.behavior.maintenanceMode && (
                      <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>ACTIVE</span>
                    )}
                  </div>
                </FormRow>
                <FormRow label="Default language">
                  <select value={params.behavior.defaultLanguage} onChange={e => update('behavior','defaultLanguage',e.target.value)} style={selectStyle}>
                    {['English (US)','English (UK)','Spanish','French','German','Portuguese'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </FormRow>
                <FormRow label="Date format">
                  <select value={params.behavior.dateFormat} onChange={e => update('behavior','dateFormat',e.target.value)} style={selectStyle}>
                    {['MM/DD/YYYY','DD/MM/YYYY','YYYY-MM-DD'].map(f => <option key={f}>{f}</option>)}
                  </select>
                </FormRow>
                <FormRow label="Number format">
                  <select value={params.behavior.numberFormat} onChange={e => update('behavior','numberFormat',e.target.value)} style={selectStyle}>
                    {['1,234.56','1.234,56','1 234,56'].map(f => <option key={f}>{f}</option>)}
                  </select>
                </FormRow>
              </FastTab>

              {/* Security */}
              <FastTab title="Security">
                <FormRow label="Password min length">
                  <input type="number" value={params.security.passwordMinLength} onChange={e => update('security','passwordMinLength',Number(e.target.value))} style={{ ...inputStyle, width: 80 }} />
                </FormRow>
                <FormRow label="Session timeout (minutes)">
                  <input type="number" value={params.security.sessionTimeout} onChange={e => update('security','sessionTimeout',Number(e.target.value))} style={{ ...inputStyle, width: 80 }} />
                </FormRow>
                <FormRow label="Max failed login attempts">
                  <input type="number" value={params.security.maxFailedLogins} onChange={e => update('security','maxFailedLogins',Number(e.target.value))} style={{ ...inputStyle, width: 80 }} />
                </FormRow>
                <FormRow label="Enable MFA">
                  <Toggle value={params.security.mfaEnabled} onChange={v => update('security','mfaEnabled',v)} />
                </FormRow>
                <FormRow label="IP whitelist" muted="One IP/CIDR per line">
                  <textarea
                    value={params.security.ipWhitelist}
                    onChange={e => update('security','ipWhitelist',e.target.value)}
                    rows={3}
                    placeholder="10.0.0.0/8&#10;192.168.1.0/24"
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 11 }}
                  />
                </FormRow>
              </FastTab>

              {/* Integration Settings */}
              <FastTab title="Integration Settings">
                <FormRow label="API endpoint">
                  <input value={params.integration.apiEndpoint} onChange={e => update('integration','apiEndpoint',e.target.value)} style={inputStyle} />
                </FormRow>
                <FormRow label="Webhook URL">
                  <input value={params.integration.webhookUrl} onChange={e => update('integration','webhookUrl',e.target.value)} placeholder="https://..." style={inputStyle} />
                </FormRow>
                <FormRow label="API key">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={params.integration.apiKey}
                      onChange={e => update('integration','apiKey',e.target.value)}
                      style={{ ...inputStyle, fontFamily: 'monospace' }}
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      style={{ ...btnSecondary, padding: '5px 10px', fontSize: 11, whiteSpace: 'nowrap' }}
                    >{showApiKey ? 'Hide' : 'Reveal'}</button>
                  </div>
                </FormRow>
              </FastTab>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: 'pointer', border: 'none',
  background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff',
}
const btnSecondary: React.CSSProperties = {
  padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer',
  background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)',
}
