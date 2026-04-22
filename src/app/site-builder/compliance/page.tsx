'use client'

import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Shield, Cookie, CheckCircle2, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ConsentLog {
  id: string
  sessionId: string
  consentType: string
  timestamp: string
  action: 'accepted' | 'rejected' | 'partial'
}

const MOCK_LOGS: ConsentLog[] = [
  { id: '1', sessionId: 'sess_a1b2', consentType: 'All Cookies', timestamp: '2026-04-22T10:15:00Z', action: 'accepted' },
  { id: '2', sessionId: 'sess_c3d4', consentType: 'Necessary Only', timestamp: '2026-04-22T09:42:00Z', action: 'rejected' },
  { id: '3', sessionId: 'sess_e5f6', consentType: 'Analytics + Necessary', timestamp: '2026-04-22T08:30:00Z', action: 'partial' },
  { id: '4', sessionId: 'sess_g7h8', consentType: 'All Cookies', timestamp: '2026-04-21T17:05:00Z', action: 'accepted' },
  { id: '5', sessionId: 'sess_i9j0', consentType: 'Necessary Only', timestamp: '2026-04-21T14:22:00Z', action: 'rejected' },
]

interface ToggleRowProps {
  label: string
  description: string
  enabled: boolean
  onChange: (v: boolean) => void
  required?: boolean
}

function ToggleRow({ label, description, enabled, onChange, required }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-800/30 last:border-0">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-zinc-200">{label}</span>
          {required && (
            <span className="text-[10px] bg-zinc-700/60 text-zinc-400 px-1.5 py-0.5 rounded font-medium">Required</span>
          )}
        </div>
        <p className="text-[12px] text-zinc-500 mt-0.5">{description}</p>
      </div>
      {required ? (
        <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-blue-600/40 cursor-not-allowed">
          <span className="inline-block h-3.5 w-3.5 translate-x-4.5 transform rounded-full bg-white/60 shadow-sm" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onChange(!enabled)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-blue-600' : 'bg-zinc-700'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
        </button>
      )}
    </div>
  )
}

function ActionChip({ action }: { action: ConsentLog['action'] }) {
  const map: Record<string, string> = {
    accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
    partial: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${map[action]}`}>
      {action}
    </span>
  )
}

export default function CookieCompliancePage() {
  const [settings, setSettings] = useState({
    bannerEnabled: true,
    gdprConsentMode: true,
    analyticsCookies: true,
    marketingCookies: false,
  })

  function toggle(k: keyof typeof settings) {
    setSettings(s => ({ ...s, [k]: !s[k] }))
  }

  const accepted = MOCK_LOGS.filter(l => l.action === 'accepted').length
  const rejected = MOCK_LOGS.filter(l => l.action === 'rejected').length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Cookie Compliance" />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-200">Cookie Compliance</h1>
            <p className="text-[12px] text-zinc-500">GDPR / CCPA consent management</p>
          </div>
        </div>

        {/* Consent stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Consent Events', value: MOCK_LOGS.length, color: 'text-zinc-200' },
            { label: 'Accepted', value: accepted, color: 'text-emerald-400' },
            { label: 'Rejected', value: rejected, color: 'text-red-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-4">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-xl font-semibold font-mono ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Toggle settings */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cookie className="w-4 h-4 text-zinc-400" />
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Cookie Settings</h2>
          </div>
          <ToggleRow
            label="Cookie Banner Enabled"
            description="Show the cookie consent banner to new visitors."
            enabled={settings.bannerEnabled}
            onChange={() => toggle('bannerEnabled')}
          />
          <ToggleRow
            label="GDPR Consent Mode"
            description="Enable Google Consent Mode v2 integration for compliant tag management."
            enabled={settings.gdprConsentMode}
            onChange={() => toggle('gdprConsentMode')}
          />
          <ToggleRow
            label="Necessary Cookies"
            description="Essential cookies required for the site to function. Cannot be disabled."
            enabled={true}
            onChange={() => {}}
            required
          />
          <ToggleRow
            label="Analytics Cookies"
            description="Allow analytics tracking (e.g. Google Analytics, Mixpanel) when consented."
            enabled={settings.analyticsCookies}
            onChange={() => toggle('analyticsCookies')}
          />
          <ToggleRow
            label="Marketing Cookies"
            description="Allow marketing and retargeting cookies (e.g. Meta Pixel, Google Ads)."
            enabled={settings.marketingCookies}
            onChange={() => toggle('marketingCookies')}
          />
        </div>

        {/* Consent Log */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/30 flex items-center gap-2">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Consent Log</h2>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {MOCK_LOGS.length}
            </span>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/20">
                {['User / Session', 'Consent Type', 'Timestamp', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_LOGS.map(log => (
                <tr key={log.id} className="border-b border-zinc-800/20 hover:bg-zinc-800/10">
                  <td className="px-5 py-2.5 font-mono text-zinc-400 text-[12px]">{log.sessionId}</td>
                  <td className="px-5 py-2.5 text-zinc-300">{log.consentType}</td>
                  <td className="px-5 py-2.5 text-zinc-400 text-[12px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {log.action === 'accepted'
                        ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        : <XCircle className="w-3 h-3 text-red-400" />}
                      <ActionChip action={log.action} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
