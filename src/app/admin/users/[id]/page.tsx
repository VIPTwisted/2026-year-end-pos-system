'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, User, Shield, Clock, RefreshCw, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SystemUser { id: string; username: string; email: string; displayName: string; role: string; storeName: string | null; isActive: boolean; lastLoginAt: string | null; loginCount: number }
interface Permission { id: string; module: string; canRead: boolean; canWrite: boolean; canDelete: boolean; canApprove: boolean }

const TABS = ['profile', 'permissions', 'sessions'] as const
type Tab = typeof TABS[number]

const MODULES = ['channels', 'registers', 'orders', 'customers', 'products', 'inventory', 'reports', 'email', 'media', 'admin']

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [user, setUser] = useState<SystemUser | null>(null)
  const [perms, setPerms] = useState<Permission[]>([])
  const [tab, setTab] = useState<Tab>('profile')
  const [form, setForm] = useState<Partial<SystemUser>>({})
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetMsg, setResetMsg] = useState('')

  useEffect(() => {
    fetch(`/api/admin/users/${id}`).then(r => r.json()).then(d => { setUser(d); setForm(d); setPerms(d.permissions ?? []) })
  }, [id])

  async function save() {
    setSaving(true)
    await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
  }

  async function resetPassword() {
    setResetting(true)
    const res = await fetch(`/api/admin/users/${id}/reset-password`, { method: 'POST' })
    const d = await res.json()
    setResetMsg(d.message)
    setResetting(false)
    setTimeout(() => setResetMsg(''), 3000)
  }

  async function updatePerm(module: string, key: string, value: boolean) {
    const existing = perms.find(p => p.module === module)
    const updated = existing
      ? { ...existing, [key]: value }
      : { module, canRead: true, canWrite: false, canDelete: false, canApprove: false, [key]: value }

    const res = await fetch(`/api/admin/users/${id}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updated, id: existing?.id }),
    })
    if (res.ok) {
      const p = await res.json()
      setPerms(prev => existing ? prev.map(x => x.id === p.id ? p : x) : [...prev, p])
    }
  }

  function getPerm(module: string): Permission {
    return perms.find(p => p.module === module) ?? { id: '', module, canRead: false, canWrite: false, canDelete: false, canApprove: false }
  }

  if (!user) return <main className="flex-1 p-6 bg-zinc-950"><div className="animate-pulse"><div className="h-6 bg-zinc-800 rounded w-48" /></div></main>

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/users" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-xs"><ChevronLeft className="w-3 h-3" /> Users</Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-sm font-semibold text-zinc-100">{user.displayName}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs rounded capitalize transition-colors', tab === t ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300')}>
            {t === 'profile' && <User className="w-3 h-3" />}
            {t === 'permissions' && <Shield className="w-3 h-3" />}
            {t === 'sessions' && <Clock className="w-3 h-3" />}
            {t}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            {[
              { label: 'Display Name', key: 'displayName' },
              { label: 'Username', key: 'username' },
              { label: 'Email', key: 'email' },
              { label: 'Store', key: 'storeName' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                <input value={(form as Record<string, string | null | boolean | number>)[f.key] as string ?? ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Role</label>
              <select value={form.role ?? 'viewer'} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none">
                {['viewer', 'cashier', 'manager', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">
              <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={resetPassword} disabled={resetting} className="flex items-center gap-1.5 px-4 py-2 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <RefreshCw className="w-3 h-3" /> {resetting ? 'Sending...' : 'Reset Password'}
            </button>
            {resetMsg && <span className="text-xs text-emerald-400 flex items-center">{resetMsg}</span>}
          </div>
        </div>
      )}

      {/* Permissions tab */}
      {tab === 'permissions' && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Module</th>
                {['Read', 'Write', 'Delete', 'Approve'].map(h => (
                  <th key={h} className="text-center px-4 py-3 font-medium uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {MODULES.map(module => {
                const perm = getPerm(module)
                return (
                  <tr key={module} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-2.5 text-zinc-300 capitalize font-medium">{module}</td>
                    {(['canRead', 'canWrite', 'canDelete', 'canApprove'] as const).map(key => (
                      <td key={key} className="px-4 py-2.5 text-center">
                        <input type="checkbox" checked={perm[key]} onChange={e => updatePerm(module, key, e.target.checked)}
                          className="rounded border-zinc-600 bg-zinc-900 accent-blue-600" />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sessions tab */}
      {tab === 'sessions' && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 text-center text-zinc-600">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Session tracking coming soon</p>
          <div className="mt-4 text-xs space-y-1">
            <div>Total logins: <span className="text-zinc-400">{user.loginCount}</span></div>
            <div>Last login: <span className="text-zinc-400">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</span></div>
          </div>
        </div>
      )}
    </main>
  )
}
