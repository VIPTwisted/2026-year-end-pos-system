'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Loader2, Plus, Trash2, Star, X, ToggleLeft, ToggleRight } from 'lucide-react'

interface Profile {
  id: string
  name: string
  isDefault: boolean
  maxFulfillSplits: number
  costWeight: number
  distanceWeight: number
  inventoryWeight: number
  allowPartialFill: boolean
  rules: Rule[]
  fulfillmentGroups: Group[]
}

interface Rule {
  id: string
  profileId: string
  ruleType: string
  name: string
  priority: number
  parameters: string
  isActive: boolean
}

interface Group {
  id: string
  profileId: string
  name: string
  groupType: string
  locationIds: string
  priority: number
  maxOrders: number | null
}

interface RunResult {
  run: {
    id: string
    ordersIn: number
    ordersRouted: number
    ordersFailed: number
    duration: number | null
    results: Array<{
      id: string
      orderLine: string
      productName: string
      qty: number
      assignedTo: string
      assignedType: string
      routingScore: number
      splitNumber: number
      reason: string
      status: string
    }>
  }
  profileName: string
}

const RULE_TYPE_DESCRIPTIONS: Record<string, string> = {
  'location-priority': 'Assigns priority score to a specific location.',
  'max-distance': 'Excludes nodes beyond a specified distance from the shipping destination.',
  'min-inventory': 'Requires a minimum on-hand quantity before a location is eligible.',
  'exclude-location': 'Permanently removes a location from consideration.',
  'prefer-location': 'Boosts routing score for a preferred location.',
  'capacity-limit': 'Caps orders a location can accept per DOM run cycle.',
}

const RULE_TYPES = Object.keys(RULE_TYPE_DESCRIPTIONS)

export default function DomProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<RunResult | null>(null)
  const [error, setError] = useState('')

  const [editName, setEditName] = useState('')
  const [editIsDefault, setEditIsDefault] = useState(false)
  const [editMaxSplits, setEditMaxSplits] = useState(3)
  const [editCostW, setEditCostW] = useState(0.4)
  const [editDistW, setEditDistW] = useState(0.3)
  const [editInvW, setEditInvW] = useState(0.3)
  const [editPartial, setEditPartial] = useState(true)

  const [showAddRule, setShowAddRule] = useState(false)
  const [ruleType, setRuleType] = useState('location-priority')
  const [ruleName, setRuleName] = useState('')
  const [rulePriority, setRulePriority] = useState(0)
  const [ruleParams, setRuleParams] = useState('{}')
  const [addingRule, setAddingRule] = useState(false)

  const [showAddGroup, setShowAddGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupType, setGroupType] = useState('store')
  const [groupLocIds, setGroupLocIds] = useState('')
  const [groupPriority, setGroupPriority] = useState(0)
  const [groupMaxOrders, setGroupMaxOrders] = useState('')
  const [addingGroup, setAddingGroup] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/dom/profiles/${id}`)
      if (!res.ok) { setError('Profile not found'); return }
      const data: Profile = await res.json()
      setProfile(data)
      setEditName(data.name)
      setEditIsDefault(data.isDefault)
      setEditMaxSplits(data.maxFulfillSplits)
      setEditCostW(data.costWeight)
      setEditDistW(data.distanceWeight)
      setEditInvW(data.inventoryWeight)
      setEditPartial(data.allowPartialFill)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  async function saveProfile() {
    setSaving(true)
    try {
      await fetch(`/api/dom/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, isDefault: editIsDefault, maxFulfillSplits: editMaxSplits, costWeight: editCostW, distanceWeight: editDistW, inventoryWeight: editInvW, allowPartialFill: editPartial }),
      })
      load()
    } finally { setSaving(false) }
  }

  async function runDom() {
    setRunning(true)
    try {
      const res = await fetch(`/api/dom/profiles/${id}/run`, { method: 'POST' })
      setRunResult(await res.json())
    } finally { setRunning(false) }
  }

  async function deleteRule(rid: string) {
    await fetch(`/api/dom/profiles/${id}/rules/${rid}`, { method: 'DELETE' })
    load()
  }

  async function toggleRule(rule: Rule) {
    await fetch(`/api/dom/profiles/${id}/rules/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...rule, isActive: !rule.isActive }),
    })
    load()
  }

  async function addRule() {
    if (!ruleName.trim()) return
    let parsedParams = {}
    try { parsedParams = JSON.parse(ruleParams) } catch { parsedParams = {} }
    setAddingRule(true)
    await fetch(`/api/dom/profiles/${id}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ruleType, name: ruleName, priority: rulePriority, parameters: parsedParams }),
    })
    setAddingRule(false); setShowAddRule(false); setRuleName(''); setRulePriority(0); setRuleParams('{}')
    load()
  }

  async function addGroup() {
    if (!groupName.trim()) return
    const locArr = groupLocIds.split(',').map((s) => s.trim()).filter(Boolean)
    setAddingGroup(true)
    await fetch(`/api/dom/profiles/${id}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: groupName, groupType, locationIds: locArr, priority: groupPriority, maxOrders: groupMaxOrders ? parseInt(groupMaxOrders) : null }),
    })
    setAddingGroup(false); setShowAddGroup(false); setGroupName(''); setGroupLocIds(''); setGroupPriority(0); setGroupMaxOrders('')
    load()
  }

  async function deleteGroup(gid: string) {
    await fetch(`/api/dom/profiles/${id}/groups/${gid}`, { method: 'DELETE' }).catch(() => {})
    load()
  }

  if (loading) return <div className="p-6 flex items-center gap-2 text-zinc-500"><Loader2 className="w-4 h-4 animate-spin" />Loading...</div>
  if (error || !profile) return <div className="p-6 text-red-400">{error || 'Not found'}</div>

  const weightSum = parseFloat((editCostW + editDistW + editInvW).toFixed(3))
  const weightValid = Math.abs(weightSum - 1.0) < 0.001

  function groupTypeBadge(t: string) {
    const map: Record<string, string> = { store: 'bg-blue-900/40 text-blue-400', warehouse: 'bg-violet-900/40 text-violet-400', dc: 'bg-yellow-900/40 text-yellow-400', vendor: 'bg-emerald-900/40 text-emerald-400' }
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[t] ?? 'bg-zinc-800 text-zinc-400'}`}>{t}</span>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dom/profiles" className="text-zinc-500 hover:text-zinc-300 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-100">{profile.name}</h1>
              {profile.isDefault && <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-yellow-900/40 text-yellow-400 border border-yellow-800/40"><Star className="w-2.5 h-2.5" />Default</span>}
            </div>
            <p className="text-xs text-zinc-500">{profile.rules.length} rules · {profile.fulfillmentGroups.length} groups</p>
          </div>
        </div>
        <button onClick={runDom} disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run DOM with this Profile
        </button>
      </div>

      {/* Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
        <h2 className="text-sm font-semibold text-zinc-300 border-b border-zinc-800 pb-3">Profile Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Name</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Max Splits</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setEditMaxSplits(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${editMaxSplits === n ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{n}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[{ label: 'Cost', val: editCostW, set: setEditCostW, color: 'text-blue-400' }, { label: 'Distance', val: editDistW, set: setEditDistW, color: 'text-emerald-400' }, { label: 'Inventory', val: editInvW, set: setEditInvW, color: 'text-violet-400' }].map(({ label, val, set, color }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex justify-between text-xs"><span className="text-zinc-500">{label} Weight</span><span className={`font-mono ${color}`}>{Math.round(val * 100)}%</span></div>
              <input type="range" min={0} max={1} step={0.01} value={val} onChange={(e) => set(parseFloat(e.target.value))} className="w-full accent-violet-500" />
            </div>
          ))}
        </div>
        <div className={`text-xs px-2 py-1 rounded inline-block ${weightValid ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
          Weight sum: {Math.round(weightSum * 100)}% {weightValid ? '✓' : '— must equal 100%'}
        </div>
        <div className="flex items-center gap-6">
          {[{ label: 'Default Profile', val: editIsDefault, set: setEditIsDefault }, { label: 'Allow Partial Fulfillment', val: editPartial, set: setEditPartial }].map(({ label, val, set }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer">
              <button type="button" onClick={() => set(!val)} className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${val ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${val ? 'translate-x-4' : ''}`} />
              </button>
              <span className="text-sm text-zinc-300">{label}</span>
            </label>
          ))}
        </div>
        <button onClick={saveProfile} disabled={saving || !weightValid}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">
          {saving && <Loader2 className="w-3 h-3 animate-spin" />}Save Settings
        </button>
      </div>

      {/* Rules */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">Fulfillment Rules</h2>
          <button onClick={() => setShowAddRule(!showAddRule)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors">
            <Plus className="w-3 h-3" />Add Rule
          </button>
        </div>
        {showAddRule && (
          <div className="px-5 py-4 bg-zinc-800/50 border-b border-zinc-800 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Rule Type</label>
                <select value={ruleType} onChange={(e) => setRuleType(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  {RULE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <p className="text-xs text-zinc-600 mt-1">{RULE_TYPE_DESCRIPTIONS[ruleType]}</p>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Rule Name</label>
                <input value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder="Descriptive name…"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder:text-zinc-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Priority</label>
                <input type="number" value={rulePriority} onChange={(e) => setRulePriority(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Parameters (JSON)</label>
                <input value={ruleParams} onChange={(e) => setRuleParams(e.target.value)} placeholder='{"locationId": "store-1"}'
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono placeholder:text-zinc-600" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAddRule(false)} className="px-3 py-1.5 border border-zinc-700 text-zinc-400 text-xs rounded-lg hover:text-zinc-200 transition-colors">Cancel</button>
              <button onClick={addRule} disabled={addingRule || !ruleName.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs rounded-lg transition-colors">
                {addingRule && <Loader2 className="w-3 h-3 animate-spin" />}Add Rule
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
              <th className="px-4 py-2 font-medium">Rule Name</th><th className="px-4 py-2 font-medium">Type</th><th className="px-4 py-2 font-medium">Priority</th><th className="px-4 py-2 font-medium">Parameters</th><th className="px-4 py-2 font-medium">Active</th><th className="px-4 py-2 font-medium"></th>
            </tr></thead>
            <tbody>
              {profile.rules.length === 0 ? <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-600 text-xs">No rules yet.</td></tr>
              : profile.rules.map((rule) => (
                <tr key={rule.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-4 py-2.5 text-zinc-200 font-medium">{rule.name}</td>
                  <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400 font-mono">{rule.ruleType}</span></td>
                  <td className="px-4 py-2.5 text-zinc-400">{rule.priority}</td>
                  <td className="px-4 py-2.5 text-zinc-500 font-mono text-xs max-w-xs truncate">{rule.parameters}</td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => toggleRule(rule)}>
                      {rule.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-zinc-600" />}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => deleteRule(rule.id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Groups */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">Fulfillment Groups</h2>
          <button onClick={() => setShowAddGroup(!showAddGroup)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors">
            <Plus className="w-3 h-3" />Add Group
          </button>
        </div>
        {showAddGroup && (
          <div className="px-5 py-4 bg-zinc-800/50 border-b border-zinc-800 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Group Name</label>
                <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. West Coast Stores"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder:text-zinc-600" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Type</label>
                <select value={groupType} onChange={(e) => setGroupType(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  {['store','warehouse','dc','vendor'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Location IDs (comma-separated)</label>
                <input value={groupLocIds} onChange={(e) => setGroupLocIds(e.target.value)} placeholder="store-001, wh-main"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder:text-zinc-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Priority</label>
                <input type="number" value={groupPriority} onChange={(e) => setGroupPriority(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Max Orders (optional)</label>
                <input type="number" value={groupMaxOrders} onChange={(e) => setGroupMaxOrders(e.target.value)} placeholder="Unlimited"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder:text-zinc-600" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAddGroup(false)} className="px-3 py-1.5 border border-zinc-700 text-zinc-400 text-xs rounded-lg hover:text-zinc-200 transition-colors">Cancel</button>
              <button onClick={addGroup} disabled={addingGroup || !groupName.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs rounded-lg transition-colors">
                {addingGroup && <Loader2 className="w-3 h-3 animate-spin" />}Add Group
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
              <th className="px-4 py-2 font-medium">Group Name</th><th className="px-4 py-2 font-medium">Type</th><th className="px-4 py-2 font-medium">Locations</th><th className="px-4 py-2 font-medium">Priority</th><th className="px-4 py-2 font-medium">Max Orders</th><th className="px-4 py-2 font-medium"></th>
            </tr></thead>
            <tbody>
              {profile.fulfillmentGroups.length === 0 ? <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-600 text-xs">No groups yet.</td></tr>
              : profile.fulfillmentGroups.map((g) => {
                let locCount = 0; try { locCount = JSON.parse(g.locationIds).length } catch { locCount = 0 }
                return (
                  <tr key={g.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                    <td className="px-4 py-2.5 text-zinc-200 font-medium">{g.name}</td>
                    <td className="px-4 py-2.5">{groupTypeBadge(g.groupType)}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{locCount} location{locCount !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{g.priority}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{g.maxOrders ?? 'Unlimited'}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => deleteGroup(g.id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run Result Modal */}
      {runResult && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col mx-4">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-100">DOM Run Results</h3>
                <p className="text-xs text-zinc-500">Profile: {runResult.profileName} · {runResult.run.duration ?? 0}ms</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center"><div className="text-lg font-bold text-emerald-400">{runResult.run.ordersRouted}</div><div className="text-xs text-zinc-500">Routed</div></div>
                <div className="text-center"><div className="text-lg font-bold text-red-400">{runResult.run.ordersFailed}</div><div className="text-xs text-zinc-500">Failed</div></div>
                <button onClick={() => setRunResult(null)} className="text-zinc-500 hover:text-zinc-300 ml-2"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-zinc-900">
                  <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                    <th className="px-4 py-2 font-medium">Line</th><th className="px-4 py-2 font-medium">Product</th><th className="px-4 py-2 font-medium">Qty</th><th className="px-4 py-2 font-medium">Assigned To</th><th className="px-4 py-2 font-medium">Type</th><th className="px-4 py-2 font-medium">Score</th><th className="px-4 py-2 font-medium">Split</th><th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {runResult.run.results.map((r) => (
                    <tr key={r.id} className="border-b border-zinc-800/50">
                      <td className="px-4 py-2 text-zinc-500 font-mono text-xs">{r.orderLine}</td>
                      <td className="px-4 py-2 text-zinc-200">{r.productName}</td>
                      <td className="px-4 py-2 text-zinc-400">{r.qty}</td>
                      <td className="px-4 py-2 text-zinc-300">{r.assignedTo || '—'}</td>
                      <td className="px-4 py-2 text-zinc-500 text-xs">{r.assignedType || '—'}</td>
                      <td className="px-4 py-2 text-zinc-400 font-mono text-xs">{r.routingScore > 0 ? r.routingScore.toFixed(3) : '—'}</td>
                      <td className="px-4 py-2 text-zinc-500">{r.splitNumber}</td>
                      <td className="px-4 py-2">
                        {r.status === 'routed' && <span className="px-2 py-0.5 rounded text-xs bg-emerald-900/50 text-emerald-400">Routed</span>}
                        {r.status === 'partial' && <span className="px-2 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-400">Partial</span>}
                        {r.status === 'unroutable' && <span className="px-2 py-0.5 rounded text-xs bg-red-900/50 text-red-400">Unroutable</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-zinc-800 flex items-center justify-between">
              <Link href={`/dom/runs/${runResult.run.id}`} className="text-xs text-blue-400 hover:text-blue-300">View full run detail →</Link>
              <button onClick={() => setRunResult(null)} className="text-xs text-zinc-500 hover:text-zinc-300">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
