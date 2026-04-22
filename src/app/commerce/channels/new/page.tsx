'use client'
import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Globe, Monitor, Phone, Wifi, ChevronRight } from 'lucide-react'

type Tab = 'general' | 'statement' | 'email'

const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'statement', label: 'Statement' },
  { id: 'email', label: 'Email Receipt' },
]

export default function NewChannelPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    channelCode: '',
    name: '',
    channelType: 'retail',
    currency: 'USD',
    timeZone: 'America/New_York',
    storeId: '',
    defaultWarehouse: '',
    // statement
    statementMethod: 'EndOfDay',
    statementIntervalHours: '24',
    closingMethod: 'Manual',
    // email
    emailReceipt: false,
    emailFrom: '',
    emailSubject: 'Your receipt from {StoreName}',
    emailLogoUrl: '',
  })

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/commerce/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelCode: form.channelCode,
          name: form.name,
          channelType: form.channelType,
          currency: form.currency,
          timeZone: form.timeZone,
          storeId: form.storeId || undefined,
          defaultWarehouse: form.defaultWarehouse || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create channel'); return }
      router.push('/commerce/channels')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Channel" />
      <main className="flex-1 p-6 overflow-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <span className="hover:text-zinc-300 cursor-pointer" onClick={() => router.push('/commerce/channels')}>Channels</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">New Channel</span>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-zinc-100">New Channel</h1>
            <div className="flex gap-3">
              <button type="button" onClick={() => router.push('/commerce/channels')}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{error}</div>
          )}

          {/* FastTab navigation */}
          <div className="flex gap-0 border-b border-zinc-800">
            {TABS.map(tab => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* General Tab */}
          {activeTab === 'general' && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">General</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Channel Code *</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                      placeholder="STORE001" value={form.channelCode}
                      onChange={e => set('channelCode', e.target.value.toUpperCase())} required />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Name *</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      placeholder="Main Street Retail" value={form.name}
                      onChange={e => set('name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Channel Type *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { val: 'retail', label: 'Retail', icon: Monitor },
                        { val: 'online', label: 'Online', icon: Wifi },
                        { val: 'call_center', label: 'Call Center', icon: Phone },
                      ] as const).map(({ val, label, icon: Icon }) => (
                        <button key={val} type="button" onClick={() => set('channelType', val)}
                          className={`flex flex-col items-center gap-1 py-3 rounded-lg border text-xs font-medium transition-all ${
                            form.channelType === val
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                              : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
                          }`}>
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Currency</label>
                    <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.currency} onChange={e => set('currency', e.target.value)}>
                      <option value="USD">USD — US Dollar</option>
                      <option value="CAD">CAD — Canadian Dollar</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="GBP">GBP — British Pound</option>
                      <option value="AUD">AUD — Australian Dollar</option>
                      <option value="MXN">MXN — Mexican Peso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Time Zone</label>
                    <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.timeZone} onChange={e => set('timeZone', e.target.value)}>
                      <option value="America/New_York">Eastern (ET)</option>
                      <option value="America/Chicago">Central (CT)</option>
                      <option value="America/Denver">Mountain (MT)</option>
                      <option value="America/Los_Angeles">Pacific (PT)</option>
                      <option value="America/Anchorage">Alaska (AKT)</option>
                      <option value="Pacific/Honolulu">Hawaii (HST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Default Warehouse</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="MAIN-WH" value={form.defaultWarehouse}
                      onChange={e => set('defaultWarehouse', e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statement Tab */}
          {activeTab === 'statement' && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Statement</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Statement Method</label>
                    <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.statementMethod} onChange={e => set('statementMethod', e.target.value)}>
                      <option value="EndOfDay">End of Day</option>
                      <option value="Shift">Per Shift</option>
                      <option value="Staff">Per Staff</option>
                      <option value="TimeInterval">Time Interval</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Statement Interval (hours)</label>
                    <input type="number" min={1} max={720}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.statementIntervalHours}
                      onChange={e => set('statementIntervalHours', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Closing Method</label>
                    <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.closingMethod} onChange={e => set('closingMethod', e.target.value)}>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-zinc-600 mt-4">Statement configuration applies when posting retail transactions to the general ledger.</p>
              </CardContent>
            </Card>
          )}

          {/* Email Receipt Tab */}
          {activeTab === 'email' && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Email Receipt</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Enable Email Receipts</p>
                      <p className="text-xs text-zinc-500">Send digital receipts to customer email on purchase</p>
                    </div>
                    <button type="button" onClick={() => set('emailReceipt', !form.emailReceipt)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${form.emailReceipt ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.emailReceipt ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  {form.emailReceipt && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">From Email Address</label>
                        <input type="email" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                          placeholder="receipts@yourstore.com" value={form.emailFrom}
                          onChange={e => set('emailFrom', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Email Subject</label>
                        <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                          value={form.emailSubject}
                          onChange={e => set('emailSubject', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-zinc-500 mb-1">Logo URL (optional)</label>
                        <input type="url" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                          placeholder="https://cdn.yourdomain.com/logo.png" value={form.emailLogoUrl}
                          onChange={e => set('emailLogoUrl', e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </main>
    </>
  )
}
