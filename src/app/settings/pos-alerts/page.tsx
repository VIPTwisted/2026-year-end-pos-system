'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import {
  Bell,
  Mail,
  BellDot,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  X,
  Plus,
  Send,
  Save,
} from 'lucide-react'

type Method = 'inapp' | 'email' | 'both'

const ALL_ROLES = [
  'Accounting',
  'Finance',
  'HR',
  'Manager',
  'COO',
  'CEO',
  'Owner',
  'Store Manager',
]

const METHOD_CARDS: {
  value: Method
  icon: React.ElementType
  label: string
  desc: string
}[] = [
  {
    value: 'inapp',
    icon: Bell,
    label: 'In-App Only',
    desc: 'Variance alerts appear in the notification bell. No email cost. Zero setup.',
  },
  {
    value: 'email',
    icon: Mail,
    label: 'Email Only',
    desc: 'Send emails to configured recipients. Requires Gmail app password.',
  },
  {
    value: 'both',
    icon: BellDot,
    label: 'Both',
    desc: 'In-app bell + email to all configured recipients.',
  },
]

export default function PosAlertsSettingsPage() {
  const [method, setMethod] = useState<Method>('inapp')
  const [threshold, setThreshold] = useState('0.01')
  const [roles, setRoles] = useState<string[]>(['Manager'])
  const [emails, setEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [smtpFrom, setSmtpFrom] = useState('')
  const [showSmtp, setShowSmtp] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Load config on mount
  useEffect(() => {
    fetch('/api/pos/alert-config')
      .then((r) => r.json())
      .then((res) => {
        const d = res.config ?? res
        if (!d || d.error) return
        if (d.notifyBoth) setMethod('both')
        else if (d.notifyEmail) setMethod('email')
        else setMethod('inapp')
        setThreshold(String(d.varianceThreshold ?? 0.01))
        setRoles(JSON.parse(d.roleRecipients || '["Manager"]'))
        setEmails(JSON.parse(d.emailRecipients || '[]'))
        setSmtpHost(d.smtpHost || 'smtp.gmail.com')
        setSmtpPort(String(d.smtpPort || 587))
        setSmtpUser(d.smtpUser || '')
        setSmtpPass(d.smtpPass || '')
        setSmtpFrom(d.smtpFrom || '')
      })
      .catch(() => {})
  }, [])

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/pos/alert-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifyInApp: method === 'inapp' || method === 'both',
          notifyEmail: method === 'email' || method === 'both',
          notifyBoth: method === 'both',
          emailRecipients: JSON.stringify(emails),
          roleRecipients: JSON.stringify(roles),
          smtpHost,
          smtpPort: parseInt(smtpPort) || 587,
          smtpUser,
          smtpPass,
          smtpFrom,
          varianceThreshold: parseFloat(threshold) || 0.01,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      showToast('Alert configuration saved.', true)
    } catch (e) {
      showToast(String(e), false)
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    try {
      const res = await fetch('/api/pos/alert-config/test', { method: 'POST' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Test failed')
      showToast('Test alert sent successfully.', true)
    } catch (e) {
      showToast(String(e), false)
    } finally {
      setTesting(false)
    }
  }

  function addEmail() {
    const v = emailInput.trim()
    if (!v || emails.includes(v)) return
    setEmails((p) => [...p, v])
    setEmailInput('')
  }

  function removeEmail(e: string) {
    setEmails((p) => p.filter((x) => x !== e))
  }

  function toggleRole(r: string) {
    setRoles((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]))
  }

  const showEmail = method === 'email' || method === 'both'

  return (
    <>
      <TopBar title="POS Alert Settings" />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-6 max-w-3xl">

          {/* Page header */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Settings / POS</p>
            <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Cash Variance Alerts</h2>
            <p className="text-[12px] text-zinc-500 mt-0.5">
              Configure how the system notifies you when a register closes with a cash variance.
            </p>
          </div>

          {/* ── Section 1: Notification Method ───────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">Notification Method</span>
              <div className="flex-1 h-px bg-zinc-800/60" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {METHOD_CARDS.map(({ value, icon: Icon, label, desc }) => {
                const active = method === value
                return (
                  <button
                    key={value}
                    onClick={() => setMethod(value)}
                    className={[
                      'text-left rounded-lg border p-4 transition-all',
                      active
                        ? 'bg-blue-600/10 border-blue-500/60 ring-1 ring-blue-500/40'
                        : 'bg-[#16213e] border-zinc-800/50 hover:border-zinc-700/80 hover:bg-[#1a2a52]',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'w-8 h-8 rounded-md flex items-center justify-center mb-3 transition-colors',
                        active ? 'bg-blue-600/20' : 'bg-zinc-800/60',
                      ].join(' ')}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-zinc-400'}`} />
                    </div>
                    <p className={`text-[13px] font-semibold mb-1 ${active ? 'text-blue-300' : 'text-zinc-200'}`}>
                      {label}
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-snug">{desc}</p>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── Section 2: Alert Threshold ────────────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">Alert Threshold</span>
              <div className="flex-1 h-px bg-zinc-800/60" />
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <label className="block text-[11px] text-zinc-400 mb-1.5">
                Minimum variance to trigger alert ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-2 text-[13px] text-zinc-100 w-40 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
              />
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Any variance above this amount triggers the alert.
              </p>
            </div>
          </section>

          {/* ── Section 3: Role Recipients (email modes only) ─────────────── */}
          {showEmail && (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">Role Recipients</span>
                <div className="flex-1 h-px bg-zinc-800/60" />
              </div>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <p className="text-[11px] text-zinc-400 mb-3">Alert these internal roles via email</p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_ROLES.map((r) => {
                    const checked = roles.includes(r)
                    return (
                      <label
                        key={r}
                        className={[
                          'flex items-center gap-2.5 cursor-pointer rounded-md px-3 py-2 transition-colors',
                          checked ? 'bg-blue-600/10' : 'hover:bg-zinc-800/40',
                        ].join(' ')}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRole(r)}
                          className="w-3.5 h-3.5 rounded accent-blue-500"
                        />
                        <span className="text-[12px] text-zinc-300">{r}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ── Section 4: External Email Recipients ─────────────────────── */}
          {showEmail && (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">External Email Recipients</span>
                <div className="flex-1 h-px bg-zinc-800/60" />
              </div>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 space-y-3">
                <p className="text-[11px] text-zinc-400">Additional email addresses</p>

                {/* Existing email tags */}
                {emails.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {emails.map((e) => (
                      <span
                        key={e}
                        className="flex items-center gap-1.5 bg-zinc-800/70 border border-zinc-700/50 rounded-full px-2.5 py-1 text-[11px] text-zinc-300"
                      >
                        {e}
                        <button
                          onClick={() => removeEmail(e)}
                          className="text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add email input */}
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                    placeholder="name@company.com"
                    className="flex-1 bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                  />
                  <button
                    onClick={addEmail}
                    className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700/50 rounded-md px-3 py-2 text-[12px] text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ── Section 5: Gmail SMTP Config ─────────────────────────────── */}
          {showEmail && (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">SMTP Configuration</span>
                <div className="flex-1 h-px bg-zinc-800/60" />
              </div>

              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowSmtp((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 text-[13px] font-medium text-zinc-300 hover:bg-zinc-800/30 transition-colors"
                >
                  <span>SMTP Configuration</span>
                  {showSmtp ? (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  )}
                </button>

                {showSmtp && (
                  <div className="px-4 pb-4 space-y-3 border-t border-zinc-800/40 pt-4">
                    {/* From Email */}
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">From Email</label>
                      <input
                        type="text"
                        value={smtpFrom}
                        onChange={(e) => setSmtpFrom(e.target.value)}
                        placeholder="alerts@yourcompany.com"
                        className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                      />
                    </div>

                    {/* Gmail User */}
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Gmail User</label>
                      <input
                        type="text"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                      />
                    </div>

                    {/* Gmail App Password */}
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Gmail App Password</label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={smtpPass}
                          onChange={(e) => setSmtpPass(e.target.value)}
                          placeholder="xxxx xxxx xxxx xxxx"
                          className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-2 pr-10 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((p) => !p)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* SMTP Host + Port */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">SMTP Host</label>
                        <input
                          type="text"
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                          className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">SMTP Port</label>
                        <input
                          type="number"
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(e.target.value)}
                          className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                        />
                      </div>
                    </div>

                    {/* Info box */}
                    <div className="bg-blue-950/30 border border-blue-800/30 rounded-md px-3 py-2.5">
                      <p className="text-[11px] text-blue-300/80 leading-snug">
                        Use a Gmail App Password (not your regular password). Create one at:{' '}
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline underline-offset-2"
                        >
                          myaccount.google.com/apppasswords
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Section 6: Test Alert ─────────────────────────────────────── */}
          {showEmail && smtpUser && (
            <section>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-zinc-200">Send Test Alert</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Sends a simulated variance email to verify your SMTP settings.
                  </p>
                </div>
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="flex items-center gap-2 bg-zinc-800 border border-zinc-700/50 rounded-md px-4 py-2 text-[12px] text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  {testing ? 'Sending…' : 'Send Test Alert'}
                </button>
              </div>
            </section>
          )}

          {/* ── Save Button ───────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pb-6">
            <div />
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md px-5 py-2.5 text-[13px] font-semibold text-white transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save Configuration'}
            </button>
          </div>

        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div
          className={[
            'fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-[13px] font-medium shadow-xl transition-all',
            toast.ok
              ? 'bg-emerald-950/90 border-emerald-700/50 text-emerald-300'
              : 'bg-red-950/90 border-red-700/50 text-red-300',
          ].join(' ')}
        >
          {toast.msg}
        </div>
      )}
    </>
  )
}
