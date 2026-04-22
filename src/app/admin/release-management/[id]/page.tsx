'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Save, CheckCircle, XCircle } from 'lucide-react'

interface FeatureFlag {
  id: string
  featureKey: string
  featureName: string
  description: string | null
  module: string | null
  waveRelease: string | null
  status: string
  enabledAt: string | null
  createdAt: string
  updatedAt: string
}

export const dynamic = 'force-dynamic'

export default function FeatureFlagDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [flag, setFlag] = useState<FeatureFlag | null>(null)
  const [form, setForm] = useState<Partial<FeatureFlag>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/release-management/${id}`)
      .then(r => r.json())
      .then(d => { setFlag(d); setForm(d) })
  }, [id])

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/admin/release-management/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { const d = await res.json(); setFlag(d); setForm(d) }
    setSaving(false)
  }

  async function setStatus(status: string) {
    const res = await fetch(`/api/admin/release-management/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    if (res.ok) { const d = await res.json(); setFlag(d); setForm(d) }
  }

  if (!flag) return <main className="flex-1 bg-[#0f0f1a] p-6 text-zinc-500 text-xs">Loading...</main>

  const isEnabled = flag.status === 'enabled'

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title={flag.featureName}
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Release Management', href: '/admin/release-management' },
        ]}
        actions={
          <div className="flex gap-2">
            <button onClick={() => setStatus(isEnabled ? 'disabled' : 'enabled')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded transition-colors ${
                isEnabled
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              }`}>
              {isEnabled ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
              {isEnabled ? 'Disable' : 'Enable'}
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors">
              <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-lg space-y-6">
        {/* Status Banner */}
        <div className={`rounded-xl p-4 border text-sm font-medium flex items-center gap-2 ${
          flag.status === 'enabled' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : flag.status === 'preview' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
        }`}>
          {flag.status === 'enabled' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          Feature is <span className="capitalize font-bold ml-1">{flag.status}</span>
          {flag.enabledAt && <span className="ml-auto text-xs opacity-70">Since {new Date(flag.enabledAt).toLocaleString()}</span>}
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          {([
            { label: 'Feature Key', k: 'featureKey' },
            { label: 'Feature Name', k: 'featureName' },
            { label: 'Description', k: 'description' },
            { label: 'Module', k: 'module' },
            { label: 'Wave Release', k: 'waveRelease' },
          ] as const).map(f => (
            <div key={f.k}>
              <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
              <input value={(form[f.k] as string) ?? ''} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600" />
            </div>
          ))}
        </div>

        {/* Audit Log */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Audit Log</h3>
          <div className="space-y-2 text-xs text-zinc-500">
            <div className="flex justify-between">
              <span>Created</span>
              <span className="text-zinc-400">{new Date(flag.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last updated</span>
              <span className="text-zinc-400">{new Date(flag.updatedAt).toLocaleString()}</span>
            </div>
            {flag.enabledAt && (
              <div className="flex justify-between">
                <span>Enabled at</span>
                <span className="text-emerald-400">{new Date(flag.enabledAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
