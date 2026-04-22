'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Send, Users, FileText, Calendar, Zap } from 'lucide-react'

interface Segment { id: string; name: string; memberCount: number; segmentType: string }

const CAMPAIGN_TYPES = ['email', 'sms', 'push', 'in-store', 'social', 'multi-channel']
const STEPS = ['Basics', 'Audience', 'Content', 'Schedule']

export default function NewCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [segments, setSegments] = useState<Segment[]>([])
  const [segSearch, setSegSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '', campaignType: 'email', budget: '', segmentId: '',
    subject: '', bodyTemplate: '', previewText: '',
    utmSource: '', utmMedium: '', utmCampaign: '',
    scheduledAt: '', sendNow: true,
  })

  useEffect(() => {
    fetch('/api/crm/segments').then(r => r.json()).then(d => setSegments(Array.isArray(d) ? d : []))
  }, [])

  function set(k: string, v: string | boolean) { setForm(f => ({ ...f, [k]: v })) }

  const selectedSeg = segments.find(s => s.id === form.segmentId)
  const filteredSegs = segments.filter(s => s.name.toLowerCase().includes(segSearch.toLowerCase()))
  const stepValid = [form.name.trim().length > 0, true, true, true]

  async function launch() {
    setSaving(true)
    const body = {
      name: form.name, campaignType: form.campaignType, budget: parseFloat(form.budget) || 0,
      segmentId: form.segmentId || null, subject: form.subject || null, bodyTemplate: form.bodyTemplate || null,
      previewText: form.previewText || null, utmSource: form.utmSource || null, utmMedium: form.utmMedium || null,
      utmCampaign: form.utmCampaign || null,
      scheduledAt: (!form.sendNow && form.scheduledAt) ? form.scheduledAt : null,
      totalRecipients: selectedSeg?.memberCount ?? 0,
    }
    const res = await fetch('/api/crm/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const campaign = await res.json()
    await fetch(`/api/crm/campaigns/${campaign.id}/launch`, { method: 'POST' })
    router.push('/crm/campaigns')
  }

  const stepIcons = [Send, Users, FileText, Calendar]

  return (
    <div className="p-6 min-h-[100dvh] bg-zinc-950 max-w-3xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-sm mb-4">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-zinc-100">New Campaign</h1>
      </div>
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const Icon = stepIcons[i]
          return (
            <div key={s} className="flex items-center gap-2">
              <button onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${i === step ? 'bg-blue-600 text-white' : i < step ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-900 text-zinc-600'}`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`w-6 h-px ${i < step ? 'bg-zinc-600' : 'bg-zinc-800'}`} />}
            </div>
          )
        })}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
        {step === 0 && (
          <>
            <h2 className="text-lg font-semibold text-zinc-100">Campaign Basics</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Campaign Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Summer Sale Email Blast"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Campaign Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {CAMPAIGN_TYPES.map(t => (
                    <button key={t} onClick={() => set('campaignType', t)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize border ${form.campaignType === t ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Budget ($)</label>
                <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="0.00"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold text-zinc-100">Select Audience</h2>
            <div className="space-y-4">
              <input value={segSearch} onChange={e => setSegSearch(e.target.value)} placeholder="Search segments..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filteredSegs.map(s => (
                  <button key={s.id} onClick={() => set('segmentId', s.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${form.segmentId === s.id ? 'border-blue-500 bg-blue-600/10' : 'border-zinc-800 hover:border-zinc-700'}`}>
                    <div>
                      <div className="text-sm font-medium text-zinc-100">{s.name}</div>
                      <div className="text-xs text-zinc-500 capitalize">{s.segmentType} segment</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-zinc-100">{s.memberCount.toLocaleString()}</div>
                      <div className="text-xs text-zinc-500">members</div>
                    </div>
                  </button>
                ))}
              </div>
              {selectedSeg && (
                <div className="flex items-center gap-2 p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400">Selected: <strong>{selectedSeg.name}</strong> · {selectedSeg.memberCount.toLocaleString()} recipients</span>
                </div>
              )}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold text-zinc-100">Campaign Content</h2>
            <div className="space-y-4">
              {[{ label: 'Subject Line', key: 'subject', ph: 'Your compelling subject line' }, { label: 'Preview Text', key: 'previewText', ph: 'Brief preview shown in inbox' }].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
                  <input value={form[f.key as keyof typeof form] as string} onChange={e => set(f.key, e.target.value)} placeholder={f.ph}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Body Template (HTML)</label>
                <textarea value={form.bodyTemplate} onChange={e => set('bodyTemplate', e.target.value)} rows={6} placeholder="<h1>Hello {{first_name}}</h1>..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{ label: 'UTM Source', key: 'utmSource', ph: 'newsletter' }, { label: 'UTM Medium', key: 'utmMedium', ph: 'email' }, { label: 'UTM Campaign', key: 'utmCampaign', ph: 'summer-sale-2026' }].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
                    <input value={form[f.key as keyof typeof form] as string} onChange={e => set(f.key, e.target.value)} placeholder={f.ph}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold text-zinc-100">Schedule Campaign</h2>
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg">
                <button onClick={() => set('sendNow', true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.sendNow ? 'bg-green-600/20 border border-green-500 text-green-400' : 'border border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}>
                  <Zap className="w-4 h-4" /> Send Now
                </button>
                <button onClick={() => set('sendNow', false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!form.sendNow ? 'bg-yellow-600/20 border border-yellow-500 text-yellow-400' : 'border border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}>
                  <Calendar className="w-4 h-4" /> Schedule
                </button>
              </div>
              {!form.sendNow && (
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Send Date & Time</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              )}
              <div className="bg-zinc-800 rounded-lg p-4 space-y-2 text-sm">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Summary</div>
                {[
                  { label: 'Campaign', value: form.name },
                  { label: 'Type', value: form.campaignType },
                  { label: 'Audience', value: selectedSeg ? `${selectedSeg.name} (${selectedSeg.memberCount.toLocaleString()})` : 'No segment' },
                  { label: 'Budget', value: `$${form.budget || '0'}` },
                  { label: 'Send', value: form.sendNow ? 'Immediately' : form.scheduledAt || 'Not set' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-zinc-300"><span>{r.label}:</span><span className="text-zinc-100 font-medium capitalize">{r.value}</span></div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex justify-between mt-6">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm disabled:opacity-40 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!stepValid[step]}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm disabled:opacity-40 transition-colors">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={launch} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
            <Send className="w-4 h-4" /> {saving ? 'Launching...' : 'Launch Campaign'}
          </button>
        )}
      </div>
    </div>
  )
}
