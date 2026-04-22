'use client'
import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

type Tab = 'general' | 'statement' | 'currency' | 'taxes' | 'background'

const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'statement', label: 'Statement' },
  { id: 'currency', label: 'Currency' },
  { id: 'taxes', label: 'Taxes' },
  { id: 'background', label: 'Background Operations' },
]

export default function NewStorePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    storeNo: '', name: '', channelType: 'RetailStore',
    currency: 'USD', taxGroup: '', taxRate: '8.25',
    timeZone: 'America/New_York',
    address: '', city: '', state: '', zip: '', phone: '', email: '',
    statementMethod: 'EndOfDay', statementIntervalHours: '24',
    emailReceipt: false, bgOperationsEnabled: true, status: 'Active',
  })

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/commerce/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          taxRate: parseFloat(form.taxRate) || 0,
          statementIntervalHours: parseFloat(form.statementIntervalHours) || 24,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create store'); return }
      router.push('/commerce/stores')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Store" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <span className="hover:text-zinc-300 cursor-pointer" onClick={() => router.push('/commerce/stores')}>Stores</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">New Store</span>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-zinc-100">New Store</h1>
            <div className="flex gap-3">
              <button type="button" onClick={() => router.push('/commerce/stores')}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{error}</div>}

          <div className="flex gap-0 border-b border-zinc-800">
            {TABS.map(tab => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'general' && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Store Number *</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono uppercase focus:outline-none focus:border-indigo-500"
                      placeholder="STORE001" value={form.storeNo}
                      onChange={e => set('storeNo', e.target.value.toUpperCase())} required />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Store Name *</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      placeholder="Main Street Store" value={form.name}
                      onChange={e => set('name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Channel Type</label>
                    <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.channelType} onChange={e => set('channelType', e.target.value)}>
                      <option value="RetailStore">Retail Store</option>
                      <option value="OnlineStore">Online Store</option>
                      <option value="CallCenter">Call Center</option>
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
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-zinc-500 mb-1">Address</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      placeholder="123 Main Street" value={form.address}
                      onChange={e => set('address', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">City</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.city} onChange={e => set('city', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">State</label>
                      <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                        placeholder="CA" maxLength={2} value={form.state}
                        onChange={e => set('state', e.target.value.toUpperCase())} />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">ZIP</label>
                      <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                        placeholder="90210" value={form.zip}
                        onChange={e => set('zip', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Phone</label>
                    <input type="tel" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      placeholder="(555) 000-0000" value={form.phone}
                      onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Email</label>
                    <input type="email" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      placeholder="store@example.com" value={form.email}
                      onChange={e => set('email', e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'statement' && (
            <Card>
              <CardContent className="pt-5 pb-5">
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
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'currency' && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Default Currency</label>
                    <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.currency} onChange={e => set('currency', e.target.value)}>
                      <option value="USD">USD — US Dollar</option>
                      <option value="CAD">CAD — Canadian Dollar</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="GBP">GBP — British Pound</option>
                      <option value="MXN">MXN — Mexican Peso</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'taxes' && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Tax Group</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      placeholder="STANDARD" value={form.taxGroup}
                      onChange={e => set('taxGroup', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Default Tax Rate (%)</label>
                    <input type="number" step="0.001" min={0} max={100}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.taxRate} onChange={e => set('taxRate', e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'background' && (
            <Card>
              <CardContent className="pt-5 pb-5 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Enable Background Operations</p>
                    <p className="text-xs text-zinc-500">Runs background sync, statement posting, and inventory updates automatically</p>
                  </div>
                  <button type="button" onClick={() => set('bgOperationsEnabled', !form.bgOperationsEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${form.bgOperationsEnabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.bgOperationsEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Email Receipts</p>
                    <p className="text-xs text-zinc-500">Automatically email receipts to customers on purchase</p>
                  </div>
                  <button type="button" onClick={() => set('emailReceipt', !form.emailReceipt)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${form.emailReceipt ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.emailReceipt ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </main>
    </>
  )
}
