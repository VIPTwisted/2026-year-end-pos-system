'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Plus, X, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface User { id: string; username: string; email: string; displayName: string; role: string; storeName: string | null; isActive: boolean; lastLoginAt: string | null; loginCount: number }

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-400 border-red-500/20',
  manager: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  cashier: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  viewer: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', displayName: '', role: 'viewer', storeName: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/admin/users').then(r => r.json()).then(setUsers) }, [])

  async function create() {
    setSaving(true)
    const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { const u = await res.json(); setUsers(prev => [u, ...prev]); setShowModal(false) }
    setSaving(false)
  }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">System Users</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{users.length} users</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
          <Plus className="w-3 h-3" /> New User
        </button>
      </div>

      {/* Role links */}
      <div className="flex gap-2 mb-4">
        <Link href="/admin/roles" className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
          <Shield className="w-3 h-3" /> Manage Roles
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">User</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Email</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Role</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Store</th>
              <th className="text-right pb-2 font-medium uppercase tracking-widest pr-6">Logins</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest">Last Login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {users.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-zinc-600">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />No users
              </td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-zinc-900/50">
                <td className="py-2.5 pr-6">
                  <Link href={`/admin/users/${u.id}`} className="font-medium text-zinc-200 hover:text-zinc-100">{u.displayName}</Link>
                  <div className="text-zinc-600 font-mono">{u.username}</div>
                </td>
                <td className="py-2.5 pr-6 text-zinc-400">{u.email}</td>
                <td className="py-2.5 pr-6">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', ROLE_STYLES[u.role] ?? ROLE_STYLES.viewer)}>
                    {u.role}
                  </span>
                </td>
                <td className="py-2.5 pr-6 text-zinc-500">{u.storeName ?? '—'}</td>
                <td className="py-2.5 pr-6 text-right text-zinc-400">{u.loginCount}</td>
                <td className="py-2.5 text-zinc-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-[440px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">New System User</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <div className="space-y-3">
              {[{ label: 'Username', key: 'username' }, { label: 'Email', key: 'email' }, { label: 'Display Name', key: 'displayName' }, { label: 'Store Name', key: 'storeName' }].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                  <input value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none">
                  <option value="viewer">Viewer</option>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-xs border border-zinc-700 text-zinc-400 rounded">Cancel</button>
              <button onClick={create} disabled={saving || !form.username || !form.email} className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded">
                {saving ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
