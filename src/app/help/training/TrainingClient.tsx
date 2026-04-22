'use client'
import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Image as ImageIcon, Clock, Lightbulb } from 'lucide-react'

interface ModuleStep {
  heading: string
  body: string
  tips?: string[]
}

interface TrainingModule {
  id: string
  name: string
  time: string
  objective: string
  steps: ModuleStep[]
}

interface Props {
  role: string
  modules: TrainingModule[]
}

const STORAGE_KEY = (role: string) => `novapos-training-complete-${role}`

export function TrainingClient({ role, modules }: Props) {
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set([modules[0]?.id]))

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY(role))
      if (stored) setCompleted(new Set(JSON.parse(stored)))
    } catch {}
  }, [role])

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const markComplete = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      try {
        localStorage.setItem(STORAGE_KEY(role), JSON.stringify([...next]))
      } catch {}
      return next
    })
  }

  const pct = modules.length > 0 ? Math.round((completed.size / modules.length) * 100) : 0

  return (
    <div>
      {/* Progress Bar */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-zinc-300">Your Progress</span>
          <span className="text-sm font-bold text-zinc-100">{completed.size} / {modules.length} modules</span>
        </div>
        <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-zinc-500">{pct}% complete</span>
          {completed.size === modules.length && completed.size > 0 && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Path complete!
            </span>
          )}
        </div>
      </div>

      {/* Module Accordions */}
      <div className="space-y-3">
        {modules.map((mod, idx) => {
          const isOpen = expanded.has(mod.id)
          const isDone = completed.has(mod.id)
          return (
            <div key={mod.id} className={`rounded-xl border transition-all ${isDone ? 'bg-emerald-950/10 border-emerald-800/30' : 'bg-zinc-900 border-zinc-800'}`}>
              {/* Header */}
              <button
                onClick={() => toggle(mod.id)}
                className="w-full flex items-center gap-3 p-5 text-left"
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${isDone ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400' : 'border-zinc-700 text-zinc-500'}`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${isDone ? 'text-emerald-300' : 'text-zinc-100'}`}>{mod.name}</span>
                    <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />{mod.time}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{mod.objective}</p>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
              </button>

              {/* Content */}
              {isOpen && (
                <div className="px-5 pb-5 border-t border-zinc-800 mt-0">
                  <div className="space-y-5 mt-5">
                    {mod.steps.map((step, si) => (
                      <div key={si} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600/15 border border-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 mt-0.5">
                          {si + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-zinc-200 mb-1">{step.heading}</p>
                          <p className="text-sm text-zinc-400 leading-relaxed">{step.body}</p>
                          {step.tips && step.tips.length > 0 && (
                            <div className="mt-3 p-3 rounded-lg bg-zinc-800 border border-zinc-700 space-y-1.5">
                              {step.tips.map((tip, ti) => (
                                <div key={ti} className="flex items-start gap-2 text-xs text-zinc-400">
                                  <Lightbulb className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                                  {tip}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Screenshot placeholder */}
                  <div className="mt-5 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center h-32 gap-2 text-zinc-600">
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-sm">Screenshot: {mod.name}</span>
                  </div>

                  {/* Mark complete */}
                  <button
                    onClick={() => markComplete(mod.id)}
                    className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isDone
                        ? 'bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 hover:bg-red-900/20 hover:border-red-700/50 hover:text-red-400'
                        : 'bg-emerald-600/15 border border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/25'
                    }`}
                  >
                    {isDone ? (
                      <><CheckCircle2 className="w-4 h-4" /> Completed — click to undo</>
                    ) : (
                      <><Circle className="w-4 h-4" /> Mark as Complete</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
