'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

const PROVIDERS = [
  { value: 'azure', label: 'Azure Communication Services' },
  { value: 'twilio', label: 'Twilio' },
  { value: 'teams', label: 'Direct Routing (Teams)' },
]

export default function NewVoiceChannelPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [provider, setProvider] = useState('azure')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [maxConcurrent, setMaxConcurrent] = useState(10)
  const [recordCalls, setRecordCalls] = useState(false)
  const [transcription, setTranscription] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { setError('Channel name is required'); return }
    if (!phoneNumber.trim()) { setError('Phone number is required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/contact-center/voice-channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phoneNumber, provider, maxConcurrent,
          recordCalls, transcription, status: 'inactive',
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      router.push('/contact-center/voice-channels')
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
        <Link href="/contact-center/voice-channels" className="hover:text-white">Voice Channels</Link>
        <span>/</span>
        <span className="text-white font-medium">New Voice Channel</span>
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
        <Link href="/contact-center/voice-channels">
          <button className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700">
            Discard
          </button>
        </Link>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm">{error}</div>
      )}

      <div className="p-6 max-w-3xl space-y-6">
        {/* General */}
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50">
          <div className="px-5 py-3 border-b border-slate-700/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <h3 className="font-semibold text-sm text-white">Channel Configuration</h3>
          </div>
          <div className="p-5 grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Channel Name <span className="text-red-400">*</span></label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. US Main Support Line"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone Number <span className="text-red-400">*</span></label>
              <input
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="+1-800-555-0100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Provider</label>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Max Concurrent Calls</label>
              <input
                type="number"
                value={maxConcurrent}
                onChange={e => setMaxConcurrent(Number(e.target.value))}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                min={1}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={recordCalls} onChange={e => setRecordCalls(e.target.checked)} className="rounded border-slate-600" />
                <span className="text-xs text-slate-400">Record Calls</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={transcription} onChange={e => setTranscription(e.target.checked)} className="rounded border-slate-600" />
                <span className="text-xs text-slate-400">Enable Transcription</span>
              </label>
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50">
          <div className="px-5 py-3 border-b border-slate-700/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <h3 className="font-semibold text-sm text-white">Provider Credentials</h3>
          </div>
          <div className="p-5 grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">API URL / Connection String</label>
              <input
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Client ID / Account SID</label>
              <input
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Client Secret / Auth Token</label>
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
      </div>
    </div>
  )
}
