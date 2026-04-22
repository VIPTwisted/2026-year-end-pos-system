'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, Plus, Zap, PauseCircle, Mail, Phone, MessageSquare, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Step = {
  id: string
  stepNumber: number
  stepType: string
  title: string
  description: string | null
  daysAfterPrev: number
}

type Sequence = {
  id: string
  name: string
  description: string | null
  status: string
  targetType: string
  steps: Step[]
}

const stepTypeIcon: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  call: <Phone className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  wait: <Clock className="w-4 h-4" />,
}

const stepTypeColor: Record<string, string> = {
  email: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  call: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  sms: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  meeting: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  wait: 'bg-zinc-700 text-zinc-400 border-zinc-600',
}

export default function SequenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [seq, setSeq] = useState<Sequence | null>(null)
  const [showStepModal, setShowStepModal] = useState(false)
  const [stepForm, setStepForm] = useState({ stepNumber: '1', stepType: 'email', title: '', description: '', daysAfterPrev: '1' })

  async function load() {
    const res = await fetch(`/api/sales/sequences/${id}`)
    const data = await res.json()
    setSeq(data)
    if (data.steps) setStepForm((f) => ({ ...f, stepNumber: String((data.steps.length || 0) + 1) }))
  }

  useEffect(() => { load() }, [id])

  async function toggle() {
    await fetch(`/api/sales/sequences/${id}/activate`, { method: 'POST' })
    load()
  }

  async function addStep() {
    await fetch(`/api/sales/sequences/${id}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...stepForm, stepNumber: parseInt(stepForm.stepNumber), daysAfterPrev: parseInt(stepForm.daysAfterPrev) }),
    })
    setShowStepModal(false)
    load()
  }

  if (!seq) return <div className="p-6 text-zinc-400">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sales/sequences" className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">{seq.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('px-2 py-0.5 rounded text-xs capitalize', seq.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400')}>{seq.status}</span>
              <span className="text-xs text-zinc-500 capitalize">Target: {seq.targetType}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowStepModal(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors">
            <Plus className="w-4 h-4" /> Add Step
          </button>
          <button onClick={toggle} className={cn('flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors', seq.status === 'active' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white')}>
            {seq.status === 'active' ? <><PauseCircle className="w-4 h-4" /> Pause</> : <><Zap className="w-4 h-4" /> Activate</>}
          </button>
        </div>
      </div>

      {seq.description && (
        <p className="text-sm text-zinc-400">{seq.description}</p>
      )}

      {/* Step Timeline */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Steps ({seq.steps.length})</h2>
        {seq.steps.length === 0 && (
          <div className="text-center py-12 border border-zinc-800 rounded-lg border-dashed">
            <p className="text-zinc-600 text-sm">No steps yet. Add the first step to get started.</p>
          </div>
        )}
        <div className="space-y-0">
          {seq.steps.map((step, idx) => (
            <div key={step.id} className="relative flex gap-4">
              {/* Connector line */}
              {idx < seq.steps.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-px bg-zinc-800 -z-0" />
              )}
              {/* Step icon */}
              <div className={cn('relative z-10 flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center', stepTypeColor[step.stepType] || 'bg-zinc-800 text-zinc-400 border-zinc-700')}>
                {stepTypeIcon[step.stepType] || <Clock className="w-4 h-4" />}
              </div>
              {/* Step content */}
              <div className="flex-1 pb-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 font-mono">Step {step.stepNumber}</span>
                        <span className={cn('px-2 py-0.5 rounded text-xs capitalize', stepTypeColor[step.stepType] || 'bg-zinc-800 text-zinc-400')}>{step.stepType}</span>
                      </div>
                      <h3 className="text-sm font-medium text-zinc-200 mt-1">{step.title}</h3>
                      {step.description && <p className="text-xs text-zinc-500 mt-1">{step.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{step.daysAfterPrev === 0 ? 'Immediately' : `+${step.daysAfterPrev}d`}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Step Modal */}
      {showStepModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">Add Step</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Step #</label>
                <input type="number" value={stepForm.stepNumber} onChange={(e) => setStepForm({ ...stepForm, stepNumber: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Days After Prev</label>
                <input type="number" value={stepForm.daysAfterPrev} onChange={(e) => setStepForm({ ...stepForm, daysAfterPrev: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Step Type</label>
              <select value={stepForm.stepType} onChange={(e) => setStepForm({ ...stepForm, stepType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500">
                {['email', 'call', 'sms', 'meeting', 'wait'].map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Title *</label>
              <input value={stepForm.title} onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <textarea value={stepForm.description} onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })} rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowStepModal(false)} className="flex-1 px-3 py-2 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={addStep} className="flex-1 px-3 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">Add Step</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
