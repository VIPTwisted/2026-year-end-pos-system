'use client'
import { useEffect, useState, useCallback } from 'react'
import { ShieldCheck, Plus, X, Lock, Eye, Clock, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GovernancePolicy {
  id: string
  policyName: string
  policyType: string
  description: string | null
  isEnabled: boolean
  lastAuditAt: string | null
  createdAt: string
}

const POLICY_CARDS = [
  { type: 'privacy', label: 'Privacy', icon: Eye, desc: 'GDPR/CCPA data subject rights, consent management, and data minimization', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { type: 'consent', label: 'Consent', icon: FileCheck, desc: 'Opt-in/opt-out tracking, consent records, and preference management', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { type: 'retention', label: 'Retention', icon: Clock, desc: 'Data lifecycle policies, purge schedules, and archival rules', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { type: 'compliance', label: 'Compliance', icon: Lock, desc: 'Regulatory compliance auditing, access controls, and SOC2/ISO27001', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
]

const POLICY_TYPES = ['privacy', 'consent', 'retention', 'compliance', 'security', 'audit']
const BLANK = { policyName: '', policyType: 'privacy', description: '', isEnabled: true }

export default function GovernancePage() {
  const [policies, setPolicies] = useState<GovernancePolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/customer-insights/governance')
      .then(r => r.json())
      .then(d => { setPolicies(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  function setF(k: string, v: string | boolean) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    await fetch('/api/customer-insights/governance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setShowModal(false)
    setForm(BLANK)
    load()
  }

  async function togglePolicy(policy: GovernancePolicy) {
    setToggling(policy.id)
    await fetch(`/api/customer-insights/governance/${policy.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isEnabled: !policy.isEnabled }),
    })
    setToggling(null)
    load()
  }

  const getPoliciesForType = (type: string) => policies.filter(p => p.policyType === type)

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-red-400" />
          <h1 className="text-xl font-bold">Data Governance</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Policy
        </button>
      </div>

      {/* Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {POLICY_CARDS.map(pc => {
          const typePolicies = getPoliciesForType(pc.type)
          const enabled = typePolicies.filter(p => p.isEnabled)
          return (
            <div key={pc.type} className={cn('border rounded-xl p-6 space-y-4', pc.bg)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <pc.icon className={cn('w-5 h-5 flex-shrink-0', pc.color)} />
                  <div>
                    <div className="text-sm font-bold text-zinc-100">{pc.label}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{pc.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <div className={cn('w-2 h-2 rounded-full', enabled.length > 0 ? 'bg-emerald-400' : 'bg-zinc-600')} />
                  <span className="text-xs text-zinc-400">{enabled.length}/{typePolicies.length} active</span>
                </div>
              </div>

              {typePolicies.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-zinc-700/50">
                  {typePolicies.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-zinc-200 truncate">{p.policyName}</div>
                        {p.lastAuditAt && <div className="text-xs text-zinc-500">Audited {new Date(p.lastAuditAt).toLocaleDateString()}</div>}
                      </div>
                      <button
                        onClick={() => togglePolicy(p)}
                        disabled={toggling === p.id}
                        className={cn('w-9 h-5 rounded-full transition-colors relative flex-shrink-0', p.isEnabled ? 'bg-emerald-500' : 'bg-zinc-700')}
                      >
                        <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all', p.isEnabled ? 'left-4' : 'left-0.5')} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {typePolicies.length === 0 && (
                <div className="pt-3 border-t border-zinc-700/50 text-center">
                  <p className="text-xs text-zinc-500">No {pc.label.toLowerCase()} policies configured</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* All Policies Table */}
      {!loading && policies.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-300">All Policies</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Name</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Type</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Last Audit</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {policies.map(p => (
                <tr key={p.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-100">{p.policyName}</td>
                  <td className="px-4 py-3"><span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded capitalize">{p.policyType}</span></td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{p.lastAuditAt ? new Date(p.lastAuditAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePolicy(p)} disabled={toggling === p.id} className={cn('w-9 h-5 rounded-full transition-colors relative', p.isEnabled ? 'bg-emerald-500' : 'bg-zinc-700')}>
                      <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all', p.isEnabled ? 'left-4' : 'left-0.5')} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">New Policy</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Policy Name</label>
                <input value={form.policyName} onChange={e => setF('policyName', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Policy Type</label>
                <select value={form.policyType} onChange={e => setF('policyType', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                  {POLICY_TYPES.map(t => <option key={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setF('description', e.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm py-2 rounded-lg transition-colors">Cancel</button>
              <button onClick={save} disabled={!form.policyName} className="flex-1 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
