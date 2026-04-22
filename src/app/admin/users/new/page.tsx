'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = ['General', 'Permissions', 'User Groups'] as const
type Tab = typeof TABS[number]

function FastTab({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold uppercase tracking-widest rounded mb-0.5 transition-colors"
      style={open
        ? { background: 'rgba(79,70,229,0.2)', color: '#a5b4fc' }
        : { background: 'rgba(255,255,255,0.03)', color: 'rgba(165,180,252,0.5)' }}
    >
      {label}
      {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
    </button>
  )
}

function Field({ label, value, onChange, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center py-2 border-b border-zinc-800/60">
      <label className="text-xs text-zinc-400 font-medium">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="col-span-2">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>
  )
}

const MODULES = ['Sales', 'Purchasing', 'Inventory', 'Finance', 'Manufacturing', 'HR', 'Admin']

export default function NewUserPage() {
  const router = useRouter()
  const [openTabs, setOpenTabs] = useState<Set<Tab>>(new Set(['General', 'Permissions']))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    username: '', email: '', displayName: '', role: 'viewer',
    isActive: true, storeName: ''
  })
  const [perms, setPerms] = useState<Record<string, { read: boolean; write: boolean; delete: boolean }>>(() =>
    Object.fromEntries(MODULES.map(m => [m, { read: true, write: false, delete: false }]))
  )

  function toggle(tab: Tab) {
    setOpenTabs(prev => {
      const next = new Set(prev)
      next.has(tab) ? next.delete(tab) : next.add(tab)
      return next
    })
  }

  function set(key: string, val: string | boolean) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function submit() {
    if (!form.username || !form.email) { setError('User Name and E-Mail are required.'); return }
    setSaving(true); setError('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      router.push('/admin/users')
    } else {
      const j = await res.json()
      setError(j.error ?? 'Failed to create user')
    }
    setSaving(false)
  }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto min-h-[100dvh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <UserPlus className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">New User</h1>
            <p className="text-[11px] text-zinc-500">Create a new system user account</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.back()} className="px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors disabled:opacity-60">
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded text-xs text-red-400 border border-red-500/30 bg-red-500/10 max-w-3xl">{error}</div>
      )}

      <div className="max-w-3xl space-y-1">
        <FastTab label="General" open={openTabs.has('General')} onToggle={() => toggle('General')} />
        {openTabs.has('General') && (
          <div className="px-4 py-3 rounded-b mb-2" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <Field label="User Name" value={form.username} onChange={v => set('username', v)} required />
            <Field label="Full Name" value={form.displayName} onChange={v => set('displayName', v)} />
            <Field label="E-Mail" value={form.email} onChange={v => set('email', v)} type="email" required />
            <div className="grid grid-cols-3 gap-4 items-center py-2 border-b border-zinc-800/60">
              <label className="text-xs text-zinc-400 font-medium">Role</label>
              <div className="col-span-2">
                <select value={form.role} onChange={e => set('role', e.target.value)}
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                  {['viewer','cashier','manager','admin'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center py-2 border-b border-zinc-800/60">
              <label className="text-xs text-zinc-400 font-medium">State</label>
              <div className="col-span-2 flex items-center gap-2">
                <button onClick={() => set('isActive', !form.isActive)}
                  className={cn('relative w-9 h-5 rounded-full transition-colors', form.isActive ? 'bg-indigo-600' : 'bg-zinc-700')}>
                  <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform', form.isActive ? 'translate-x-4' : 'translate-x-0.5')} />
                </button>
                <span className="text-xs text-zinc-400">{form.isActive ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            <Field label="Store" value={form.storeName} onChange={v => set('storeName', v)} />
          </div>
        )}

        <FastTab label="Permissions" open={openTabs.has('Permissions')} onToggle={() => toggle('Permissions')} />
        {openTabs.has('Permissions') && (
          <div className="px-4 py-3 rounded-b mb-2" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Module</th>
                    {['Read','Write','Delete'].map(h => (
                      <th key={h} className="text-center pb-2 font-medium uppercase tracking-widest w-16">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map(m => (
                    <tr key={m} className="border-b border-zinc-800/40 hover:bg-zinc-800/20">
                      <td className="py-2 pr-6 text-zinc-300">{m}</td>
                      {(['read','write','delete'] as const).map(p => (
                        <td key={p} className="py-2 text-center">
                          <input type="checkbox" checked={perms[m][p]}
                            onChange={e => setPerms(prev => ({ ...prev, [m]: { ...prev[m], [p]: e.target.checked } }))}
                            className="accent-indigo-500 w-3.5 h-3.5" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <FastTab label="User Groups" open={openTabs.has('User Groups')} onToggle={() => toggle('User Groups')} />
        {openTabs.has('User Groups') && (
          <div className="px-4 py-3 rounded-b mb-2" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <p className="text-xs text-zinc-600 py-2">No user groups configured. Assign permission sets directly.</p>
          </div>
        )}
      </div>
    </main>
  )
}
