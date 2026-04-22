'use client'
import { useEffect, useState, useCallback } from 'react'
import { Brain, Play, Plus, X, TrendingUp, Users, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PredictionModel {
  id: string
  modelName: string
  modelType: string
  description: string | null
  status: string
  accuracy: number | null
  profilesScored: number
  lastRunAt: string | null
}

const FIXED_MODELS = [
  { type: 'clv', label: 'CLV Model', icon: TrendingUp, desc: 'Predict customer lifetime value over 12 months', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { type: 'churn', label: 'Churn Model', icon: Target, desc: 'Score customers by probability of churn in 90 days', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { type: 'recommendations', label: 'Product Recommendations', icon: Users, desc: 'Collaborative filtering for next-best-product', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
]

const BLANK = { modelName: '', modelType: 'churn', description: '' }

function statusBadge(s: string) {
  if (s === 'active') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  if (s === 'running') return 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse'
  if (s === 'trained') return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  if (s === 'error') return 'bg-red-500/20 text-red-400 border-red-500/30'
  return 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30'
}

export default function PredictionsPage() {
  const [models, setModels] = useState<PredictionModel[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [running, setRunning] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/customer-insights/predictions')
      .then(r => r.json())
      .then(d => { setModels(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    await fetch('/api/customer-insights/predictions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setShowModal(false)
    setForm(BLANK)
    load()
  }

  async function runModel(id: string) {
    setRunning(id)
    await fetch(`/api/customer-insights/predictions/${id}/run`, { method: 'POST' })
    setRunning(null)
    load()
  }

  const getModelForType = (type: string) => models.find(m => m.modelType === type)

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-pink-400" />
          <h1 className="text-xl font-bold">Prediction Models</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-pink-700 hover:bg-pink-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Model
        </button>
      </div>

      {/* Fixed Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FIXED_MODELS.map(fm => {
          const model = getModelForType(fm.type)
          return (
            <div key={fm.type} className={cn('border rounded-xl p-6 space-y-4', fm.bg)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <fm.icon className={cn('w-6 h-6', fm.color)} />
                  <div>
                    <div className="text-sm font-bold text-zinc-100">{fm.label}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{fm.desc}</div>
                  </div>
                </div>
              </div>
              {model ? (
                <div className="space-y-2 pt-2 border-t border-zinc-700/50">
                  <div className="flex items-center justify-between">
                    <span className={cn('text-xs px-2 py-0.5 rounded border capitalize', statusBadge(model.status))}>{model.status}</span>
                    {model.accuracy != null && (
                      <span className="text-xs text-zinc-300 font-mono">{(model.accuracy * 100).toFixed(1)}% accuracy</span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400">
                    Profiles scored: <span className="text-zinc-200">{model.profilesScored.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Last run: <span className="text-zinc-200">{model.lastRunAt ? new Date(model.lastRunAt).toLocaleString() : 'Never'}</span>
                  </div>
                  <button
                    onClick={() => runModel(model.id)}
                    disabled={running === model.id || model.status === 'running'}
                    className={cn('w-full flex items-center justify-center gap-2 text-sm py-2 rounded-lg transition-colors mt-2', `bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 ${fm.color}`)}
                  >
                    <Play className="w-3.5 h-3.5" />
                    {running === model.id ? 'Starting...' : model.status === 'running' ? 'Running...' : 'Run Model'}
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-zinc-700/50 text-center">
                  <div className="text-xs text-zinc-500 mb-3">No model configured</div>
                  <button
                    onClick={() => { setForm({ modelName: fm.label, modelType: fm.type, description: fm.desc }); setShowModal(true) }}
                    className="text-xs text-zinc-400 hover:text-zinc-200 underline transition-colors"
                  >
                    Create this model
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Additional Models */}
      {!loading && models.filter(m => !FIXED_MODELS.map(f => f.type).includes(m.modelType)).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Custom Models</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-400 font-medium px-4 py-3">Name</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-3">Type</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-3">Status</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-3">Accuracy</th>
                  <th className="text-right text-zinc-400 font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.filter(m => !FIXED_MODELS.map(f => f.type).includes(m.modelType)).map(m => (
                  <tr key={m.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-100">{m.modelName}</td>
                    <td className="px-4 py-3"><span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded">{m.modelType}</span></td>
                    <td className="px-4 py-3"><span className={cn('text-xs px-2 py-0.5 rounded border capitalize', statusBadge(m.status))}>{m.status}</span></td>
                    <td className="px-4 py-3 font-mono text-zinc-300">{m.accuracy != null ? `${(m.accuracy * 100).toFixed(1)}%` : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => runModel(m.id)} disabled={running === m.id} className="text-xs text-pink-400 hover:text-pink-300 disabled:opacity-50 transition-colors flex items-center gap-1 ml-auto">
                        <Play className="w-3.5 h-3.5" /> Run
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">New Prediction Model</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Model Name</label>
                <input value={form.modelName} onChange={e => setF('modelName', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Model Type</label>
                <select value={form.modelType} onChange={e => setF('modelType', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500">
                  <option value="churn">Churn</option>
                  <option value="clv">CLV</option>
                  <option value="recommendations">Recommendations</option>
                  <option value="segmentation">Segmentation</option>
                  <option value="sentiment">Sentiment</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Description</label>
                <input value={form.description} onChange={e => setF('description', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm py-2 rounded-lg transition-colors">Cancel</button>
              <button onClick={save} disabled={!form.modelName} className="flex-1 bg-pink-700 hover:bg-pink-600 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
