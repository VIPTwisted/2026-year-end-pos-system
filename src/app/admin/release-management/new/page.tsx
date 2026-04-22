'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

export default function NewFeatureFlagPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    featureKey: '',
    featureName: '',
    description: '',
    module: '',
    waveRelease: '',
    status: 'disabled',
  })

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function save() {
    if (!form.featureKey || !form.featureName) return
    setSaving(true)
    const res = await fetch('/api/admin/release-management', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { const d = await res.json(); router.push(`/admin/release-management/${d.id}`) }
    setSaving(false)
  }

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title="New Feature Flag"
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Release Management', href: '/admin/release-management' },
        ]}
      />
      <div className="p-6 max-w-lg space-y-6">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          {[
            { label: 'Feature Key *', k: 'featureKey', placeholder: 'e.g. ENABLE_NEW_CHECKOUT' },
            { label: 'Feature Name *', k: 'featureName', placeholder: 'Display name' },
            { label: 'Description', k: 'description', placeholder: 'Optional description' },
            { label: 'Module', k: 'module', placeholder: 'e.g. Checkout, Inventory' },
            { label: 'Wave Release', k: 'waveRelease', placeholder: 'e.g. 2026 Wave 1' },
          ].map(f => (
            <div key={f.k}>
              <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
              <input value={(form as Record<string, string>)[f.k]} onChange={e => set(f.k, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Initial Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
              <option value="disabled">Disabled</option>
              <option value="preview">Preview</option>
              <option value="enabled">Enabled</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 text-xs border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={save} disabled={saving || !form.featureKey || !form.featureName}
            className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors">
            {saving ? 'Saving...' : 'Create Feature'}
          </button>
        </div>
      </div>
    </main>
  )
}
