'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

type ScriptStep = {
  stepNo: number
  stepType: string
  scriptText: string
  suggestedResponse: string
  nextStepLogic: string
}

const STEP_TYPES = ['Greeting', 'Question', 'Action', 'ObjectionHandler', 'Close']
const SCENARIOS = [
  { value: 'greeting', label: 'Inbound Sales' },
  { value: 'escalation', label: 'Support' },
  { value: 'objection', label: 'Complaint' },
  { value: 'closing', label: 'Retention' },
  { value: 'custom', label: 'Custom' },
]
const LANGUAGES = ['en-US', 'es-US', 'fr-FR', 'de-DE', 'pt-BR']
const CHANNELS = ['all', 'voice', 'chat', 'email']

export default function NewAgentScriptPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [scenario, setScenario] = useState('greeting')
  const [language, setLanguage] = useState('en-US')
  const [channel, setChannel] = useState('all')
  const [description, setDescription] = useState('')

  const [steps, setSteps] = useState<ScriptStep[]>([
    { stepNo: 1, stepType: 'Greeting', scriptText: '', suggestedResponse: '', nextStepLogic: '' },
  ])

  const addStep = () => setSteps(prev => [
    ...prev,
    { stepNo: prev.length + 1, stepType: 'Question', scriptText: '', suggestedResponse: '', nextStepLogic: '' },
  ])

  const removeStep = (i: number) =>
    setSteps(prev => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNo: idx + 1 })))

  const updateStep = (i: number, field: keyof ScriptStep, value: string | number) =>
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/contact-center/agent-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, scriptType: scenario, channel, description: description || null,
          contentJson: JSON.stringify({ language, steps }), isActive: true,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const script = await res.json()

      // Save steps
      await fetch(`/api/contact-center/agent-scripts/${script.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps }),
      }).catch(() => {})

      router.push('/contact-center/agent-scripts')
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
        <Link href="/contact-center/agent-scripts" className="hover:text-white">Agent Scripts</Link>
        <span>/</span>
        <span className="text-white font-medium">New Agent Script</span>
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
        <Link href="/contact-center/agent-scripts">
          <button className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700">
            Discard
          </button>
        </Link>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm">{error}</div>
      )}

      <div className="p-6 max-w-5xl space-y-6">
        {/* Header FastTab */}
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50">
          <div className="px-5 py-3 border-b border-slate-700/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <h3 className="font-semibold text-sm text-white">Script Header</h3>
          </div>
          <div className="p-5 grid grid-cols-3 gap-5">
            <div className="col-span-3">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Script Name <span className="text-red-400">*</span></label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Inbound Sales Opening Script"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Scenario</label>
              <select
                value={scenario}
                onChange={e => setScenario(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {SCENARIOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Channel</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Steps FastTab */}
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50">
          <div className="px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <h3 className="font-semibold text-sm text-white">Script Steps</h3>
            </div>
            <button
              onClick={addStep}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded"
            >
              + Add Step
            </button>
          </div>
          <div className="p-4 space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="border border-slate-700/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600/30 text-blue-300 text-xs w-7 h-7 rounded-full flex items-center justify-center font-bold">
                      {step.stepNo}
                    </span>
                    <select
                      value={step.stepType}
                      onChange={e => updateStep(i, 'stepType', e.target.value)}
                      className="bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      {STEP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <button onClick={() => removeStep(i)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Script Text</label>
                    <textarea
                      value={step.scriptText}
                      onChange={e => updateStep(i, 'scriptText', e.target.value)}
                      rows={2}
                      className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="What the agent says..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Suggested Response</label>
                    <textarea
                      value={step.suggestedResponse}
                      onChange={e => updateStep(i, 'suggestedResponse', e.target.value)}
                      rows={2}
                      className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="Expected customer response..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Next Step Logic</label>
                    <input
                      value={step.nextStepLogic}
                      onChange={e => updateStep(i, 'nextStepLogic', e.target.value)}
                      className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g. If yes → Step 3, If no → Step 5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
