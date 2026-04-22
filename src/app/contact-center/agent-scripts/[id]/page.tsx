'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

type ScriptStep = {
  id?: string; stepNo: number; stepType: string
  scriptText?: string | null; suggestedResponse?: string | null; nextStepLogic?: string | null
}
type Script = {
  id: string; name: string; scriptType: string; channel: string; isActive: boolean
  description?: string | null; contentJson?: string | null; createdAt: string; updatedAt: string
  steps: ScriptStep[]
}

const STEP_TYPES = ['Greeting', 'Question', 'Action', 'ObjectionHandler', 'Close']
const STEP_COLOR: Record<string, string> = {
  Greeting: 'bg-blue-500/20 text-blue-300',
  Question: 'bg-purple-500/20 text-purple-300',
  Action: 'bg-yellow-500/20 text-yellow-300',
  ObjectionHandler: 'bg-red-500/20 text-red-300',
  Close: 'bg-emerald-500/20 text-emerald-300',
}

export default function AgentScriptDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [script, setScript] = useState<Script | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view')
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState('')
  const [editSteps, setEditSteps] = useState<ScriptStep[]>([])
  const [walkthroughStep, setWalkthroughStep] = useState(0)

  useEffect(() => {
    fetch(`/api/contact-center/agent-scripts/${id}`)
      .then(r => r.json())
      .then(d => {
        setScript(d)
        setEditName(d.name)
        setEditSteps(d.steps ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/contact-center/agent-scripts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, steps: editSteps }),
    })
    const updated = await fetch(`/api/contact-center/agent-scripts/${id}`).then(r => r.json())
    setScript(updated); setEditSteps(updated.steps ?? [])
    setSaving(false)
  }

  const updateStep = (i: number, field: keyof ScriptStep, value: string | number) =>
    setEditSteps(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  const addStep = () => setEditSteps(prev => [
    ...prev,
    { stepNo: prev.length + 1, stepType: 'Question', scriptText: '', suggestedResponse: '', nextStepLogic: '' },
  ])

  const removeStep = (i: number) =>
    setEditSteps(prev => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNo: idx + 1 })))

  if (loading) return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white flex items-center justify-center">
      <div className="text-slate-400">Loading...</div>
    </div>
  )
  if (!script) return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white flex items-center justify-center">
      <div className="text-red-400">Script not found.</div>
    </div>
  )

  const currentStep = script.steps[walkthroughStep]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      {/* TopBar */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-3 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/contact-center" className="hover:text-white">Contact Center</Link>
        <span>/</span>
        <Link href="/contact-center/agent-scripts" className="hover:text-white">Agent Scripts</Link>
        <span>/</span>
        <span className="text-white font-medium">{script.name}</span>
      </div>

      {/* Action Ribbon */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-2 flex items-center gap-2">
        {activeTab === 'edit' && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs px-4 py-1.5 rounded font-medium"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
        <Link href="/contact-center/agent-scripts">
          <button className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700">Back</button>
        </Link>
      </div>

      <div className="p-6 flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab Headers */}
          <div className="flex gap-1 border-b border-slate-700/50">
            {(['view', 'edit'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'view' ? 'Walkthrough View' : 'Edit Steps'}
              </button>
            ))}
          </div>

          {/* Walkthrough View */}
          {activeTab === 'view' && (
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="flex items-center gap-2">
                {script.steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setWalkthroughStep(i)}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                      i === walkthroughStep ? 'bg-blue-500' : i < walkthroughStep ? 'bg-blue-500/40' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {currentStep ? (
                <div className="bg-[#16213e] rounded-lg border border-slate-700/50 p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-600/30 text-blue-300 text-sm w-9 h-9 rounded-full flex items-center justify-center font-bold">
                        {currentStep.stepNo}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STEP_COLOR[currentStep.stepType] ?? 'bg-slate-500/20 text-slate-300'}`}>
                        {currentStep.stepType}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">Step {walkthroughStep + 1} of {script.steps.length}</span>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-400 mb-2">Script Text</div>
                    <div className="bg-[#0f0f1a] rounded p-3 text-sm text-white min-h-[60px]">
                      {currentStep.scriptText || <span className="text-slate-500 italic">No script text defined.</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-400 mb-2">Suggested Customer Response</div>
                    <div className="bg-[#0f0f1a] rounded p-3 text-sm text-slate-300 min-h-[40px]">
                      {currentStep.suggestedResponse || <span className="text-slate-500 italic">—</span>}
                    </div>
                  </div>
                  {currentStep.nextStepLogic && (
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-2">Next Step Logic</div>
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-xs text-yellow-300">
                        {currentStep.nextStepLogic}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setWalkthroughStep(w => Math.max(0, w - 1))}
                      disabled={walkthroughStep === 0}
                      className="text-xs px-4 py-2 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setWalkthroughStep(w => Math.min(script.steps.length - 1, w + 1))}
                      disabled={walkthroughStep === script.steps.length - 1}
                      className="text-xs px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#16213e] rounded-lg border border-slate-700/50 p-8 text-center text-slate-500 text-sm">
                  No steps defined. Switch to Edit mode to add steps.
                </div>
              )}
            </div>
          )}

          {/* Edit Steps */}
          {activeTab === 'edit' && (
            <div className="space-y-4">
              <div className="bg-[#16213e] rounded-lg border border-slate-700/50 p-4">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Script Name</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-3">
                {editSteps.map((step, i) => (
                  <div key={i} className="bg-[#16213e] rounded-lg border border-slate-700/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-600/30 text-blue-300 text-xs w-7 h-7 rounded-full flex items-center justify-center font-bold">
                          {step.stepNo}
                        </span>
                        <select
                          value={step.stepType}
                          onChange={e => updateStep(i, 'stepType', e.target.value)}
                          className="bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        >
                          {STEP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <button onClick={() => removeStep(i)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Script Text</label>
                        <textarea
                          value={step.scriptText ?? ''}
                          onChange={e => updateStep(i, 'scriptText', e.target.value)}
                          rows={2}
                          className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1.5 text-xs text-white resize-none focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Suggested Response</label>
                        <textarea
                          value={step.suggestedResponse ?? ''}
                          onChange={e => updateStep(i, 'suggestedResponse', e.target.value)}
                          rows={2}
                          className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1.5 text-xs text-white resize-none focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">Next Step Logic</label>
                        <input
                          value={step.nextStepLogic ?? ''}
                          onChange={e => updateStep(i, 'nextStepLogic', e.target.value)}
                          className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addStep}
                  className="w-full text-xs border border-dashed border-slate-600 rounded-lg py-3 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                >
                  + Add Step
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FactBox Sidebar */}
        <div className="w-64 shrink-0 space-y-4">
          <div className="bg-[#16213e] rounded-lg border border-slate-700/50 p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Script Info</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Steps</span><span className="text-white">{script.steps.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="text-white capitalize">{script.scriptType}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Channel</span><span className="text-white capitalize">{script.channel}</span></div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className={script.isActive ? 'text-emerald-400' : 'text-slate-400'}>
                  {script.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-[#16213e] rounded-lg border border-slate-700/50 p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Step Types</h4>
            {STEP_TYPES.map(type => {
              const count = script.steps.filter(s => s.stepType === type).length
              return count > 0 ? (
                <div key={type} className="flex justify-between py-1 text-xs">
                  <span className="text-slate-400">{type}</span>
                  <span className="text-white">{count}</span>
                </div>
              ) : null
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
