'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Settings2, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'

export default function NewDomProfilePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [maxFulfillSplits, setMaxFulfillSplits] = useState(3)
  const [costWeight, setCostWeight] = useState(0.4)
  const [distanceWeight, setDistanceWeight] = useState(0.3)
  const [inventoryWeight, setInventoryWeight] = useState(0.3)
  const [allowPartialFill, setAllowPartialFill] = useState(true)

  const weightSum = parseFloat((costWeight + distanceWeight + inventoryWeight).toFixed(3))
  const weightValid = Math.abs(weightSum - 1.0) < 0.001

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    if (!weightValid) { setError('Weights must sum to 1.0'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/dom/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, isDefault, maxFulfillSplits, costWeight, distanceWeight, inventoryWeight, allowPartialFill }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/dom/profiles/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dom/profiles" className="text-zinc-500 hover:text-zinc-300 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center"><Settings2 className="w-4 h-4 text-blue-400" /></div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">New DOM Profile</h1>
            <p className="text-xs text-zinc-500">Create a new order routing configuration</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-950/40 border border-red-900/40 rounded-lg text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
          <h2 className="text-sm font-semibold text-zinc-300 border-b border-zinc-800 pb-3">Basic Settings</h2>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Profile Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Default Routing Profile"
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder:text-zinc-600" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-300">Set as Default Profile</div>
              <div className="text-xs text-zinc-500">Used when no profile is specified</div>
            </div>
            <button type="button" onClick={() => setIsDefault(!isDefault)}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${isDefault ? 'bg-blue-600' : 'bg-zinc-700'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isDefault ? 'translate-x-4' : ''}`} />
            </button>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Max Fulfillment Splits</label>
            <div className="flex items-center gap-3">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setMaxFulfillSplits(n)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${maxFulfillSplits === n ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{n}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-300">Allow Partial Fulfillment</div>
              <div className="text-xs text-zinc-500">Ship available items, backorder rest</div>
            </div>
            <button type="button" onClick={() => setAllowPartialFill(!allowPartialFill)}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${allowPartialFill ? 'bg-blue-600' : 'bg-zinc-700'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${allowPartialFill ? 'translate-x-4' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-300">Routing Weights</h2>
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${weightValid ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
              Sum: {Math.round(weightSum * 100)}% {weightValid ? '✓' : '≠ 100%'}
            </span>
          </div>
          {[
            { label: 'Cost Weight', val: costWeight, set: setCostWeight, color: 'text-blue-400' },
            { label: 'Distance Weight', val: distanceWeight, set: setDistanceWeight, color: 'text-emerald-400' },
            { label: 'Inventory Weight', val: inventoryWeight, set: setInventoryWeight, color: 'text-violet-400' },
          ].map(({ label, val, set, color }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">{label}</span>
                <span className={`font-mono ${color}`}>{Math.round(val * 100)}%</span>
              </div>
              <input type="range" min={0} max={1} step={0.01} value={val}
                onChange={(e) => set(parseFloat(e.target.value))}
                className="w-full accent-violet-500" />
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link href="/dom/profiles" className="flex-1 px-4 py-2.5 border border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-sm text-center transition-colors">Cancel</Link>
          <button type="submit" disabled={saving || !weightValid}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}Create Profile
          </button>
        </div>
      </form>
    </div>
  )
}
