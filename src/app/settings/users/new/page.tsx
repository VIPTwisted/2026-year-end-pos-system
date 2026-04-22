'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

const ROLES = ['admin', 'manager', 'cashier', 'warehouse', 'accountant'] as const
type Role = typeof ROLES[number]

interface ToastState {
  msg: string
  type: 'ok' | 'err'
}

export default function NewUserPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<Role>('cashier')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) {
      notify('Name, email, and password are required.', 'err')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
      })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        notify(body.error ?? 'Failed to create user', 'err')
        return
      }
      notify('User created', 'ok')
      setTimeout(() => router.push('/settings/users'), 600)
    } catch {
      notify('Network error', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar
        title="New User"
        breadcrumb={[
          { label: 'Settings', href: '/settings' },
          { label: 'Users', href: '/settings/users' },
        ]}
      />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="px-6 py-5 max-w-2xl mx-auto space-y-6">

          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-medium shadow-xl transition-all ${
                toast.type === 'ok'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              {toast.msg}
            </div>
          )}

          {/* Back */}
          <Link
            href="/settings/users"
            className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Back to Users
          </Link>

          <div>
            <h2 className="text-[18px] font-semibold text-zinc-100">Create New User</h2>
            <p className="text-[12px] text-zinc-500 mt-0.5">Provide credentials and assign a role</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  autoComplete="off"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@store.local"
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  autoComplete="off"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-3 py-2 pr-10 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors capitalize"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r} className="capitalize">
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end">
              <Link
                href="/settings/users"
                className="px-4 py-2 text-[13px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium transition-colors"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
