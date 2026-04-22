'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

const CONNECTOR_TYPES = [
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'dynamics', label: 'NovaPOS CRM' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'servicenow', label: 'ServiceNow' },
  { value: 'zendesk', label: 'Zendesk' },
  { value: 'custom', label: 'Custom API' },
]

const SYNC_FREQUENCIES = [
  { value: '5', label: 'Every 5 minutes' },
  { value: '15', label: 'Every 15 minutes' },
  { value: '60', label: 'Every hour' },
  { value: '1440', label: 'Every day' },
  { value: '0', label: 'Manual only' },
]

const RECORD_TYPES = ['Contacts', 'Cases', 'Accounts', 'Opportunities', 'Activities', 'Leads']

export default function NewConnectorPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showSecret, setShowSecret] = useState(false)

  const [name, setName] = useState('')
  const [connectorType, setConnectorType] = useState('salesforce')
  const [apiUrl, setApiUrl] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [syncFrequency, setSyncFrequency] = useState('60')
  const [selectedRecordTypes, setSelectedRecordTypes] = useState<string[]>(['Contacts', 'Cases'])
  const [syncEnabled, setSyncEnabled] = useState(true)

  const toggleRecordType = (rt: string) =>
    setSelectedRecordTypes(prev =>
      prev.includes(rt) ? prev.filter(x => x !== rt) : [...prev, rt]
    )

  const handleSave = async () => {
    if (!name.trim()) { setError('Connector name is required'); return }
    setSaving(true); setError('')
    try {
      const configJson = JSON.stringify({
        apiUrl, clientId, clientSecret: clientSecret ? '[MASKED]' : '',
        syncFrequency: Number(syncFrequency),
        recordTypes: selectedRecordTypes,
      })
      const res = await fetch('/api/contact-center/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, connectorType, status: 'disconnected',
          configJson, syncEnabled,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      router.push('/contact-center/connectors')
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      {/* TopBar */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-3 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/contact-center" className="hover:text-white">Contact Center</Link>
        <span>/</span>
        <Link href="/contact-center/connectors" className="hover:text-white">CRM Connectors</Link>
        <span>/</span>
        <span className="text-white font-medium">New Connector</span>
      </div>

      {/* Action Ribbon */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-2 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs px-4 py-1.5 rounded font-medium"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <Link href="/contact-center/connectors">
          <button className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700">
            Discard
          </button>
        </Link>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm">{error}</div>
      )}

      <div className="p-6 max-w-3xl space-y-6">
        {/* Connector Type Selector */}
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50">
          <div className="px-5 py-3 border-b border-slate-700/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <h3 className="font-semibold text-sm text-white">Connector Identity</h3>
          </div>
          <div className="p-5 grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Connector Name <span className="text-red-400">*</span></label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Salesforce Production"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Connector Type</label>
              <div className="grid grid-cols-3 gap-2">
                {CONNECTOR_TYPES.map(ct => (
                  <button
                    key={ct.value}
                    type="button"
                    onClick={() => setConnectorType(ct.value)}
                    className={`px-3 py-2 rounded border text-xs font-medium transition-colors ${
                      connectorType === ct.value
                        ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={syncEnabled} onChange={e => setSyncEnabled(e.target.checked)} className="rounded border-slate-600" />
                <span className="text-xs text-slate-400">Enable Automatic Sync</span>
              </label>
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50">
          <div className="px-5 py-3 border-b border-slate-700/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <h3 className="font-semibold text-sm text-white">API Credentials</h3>
          </div>
          <div className="p-5 grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">API URL</label>
              <input
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                placeholder="https://your-instance.salesforce.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Client ID</label>
              <input
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Client Secret</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={clientSecret}
                  onChange={e => setClientSecret(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 pr-16 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  {showSecret ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50">
          <div className="px-5 py-3 border-b border-slate-700/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <h3 className="font-semibold text-sm text-white">Sync Settings</h3>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Sync Frequency</label>
              <select
                value={syncFrequency}
                onChange={e => setSyncFrequency(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 max-w-xs"
              >
                {SYNC_FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-3">Record Types to Sync</label>
              <div className="grid grid-cols-3 gap-2">
                {RECORD_TYPES.map(rt => (
                  <label key={rt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRecordTypes.includes(rt)}
                      onChange={() => toggleRecordType(rt)}
                      className="rounded border-slate-600"
                    />
                    <span className="text-xs text-slate-300">{rt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
