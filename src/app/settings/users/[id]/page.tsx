'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

const ROLES = ['admin', 'manager', 'cashier', 'warehouse', 'accountant'] as const
type Role = typeof ROLES[number]

interface UserData {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  employee?: {
    store?: { id: string; name: string } | null
  } | null
}

interface ToastState {
  msg: string
  type: 'ok' | 'err'
}

const ROLE_BADGE: Record<string, string> = {
  admin:      'bg-red-500/10 text-red-400',
  manager:    'bg-amber-500/10 text-amber-400',
  cashier:    'bg-blue-500/10 text-blue-400',
  warehouse:  'bg-emerald-500/10 text-emerald-400',
  accountant: 'bg-purple-500/10 text-purple-400',
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('cashier')
  const [isActive, setIsActive] = useState(true)

  // Password change
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Saving
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  // Deactivate confirmation
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  useEffect(() => {
    fetch(`/api/settings/users/${id}`)
      .then(async r => {
        if (!r.ok) throw new Error('Not found')
        return r.json() as Promise<UserData>
      })
      .then(data => {
        setUser(data)
        setName(data.name)
        setEmail(data.email)
        setRole(data.role as Role)
        setIsActive(data.isActive)
      })
      .catch(() => setFetchError('Failed to load user'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      notify('Name and email are required.', 'err')
      return
    }

    setSaving(true)
    try {
      const body: {
        name: string
        email: string
        role: Role
        isActive: boolean
        newPassword?: string
      } = {
        name: name.trim(),
        email: email.trim(),
        role,
        isActive,
      }
      if (newPassword) body.newPassword = newPassword

      const res = await fetch(`/api/settings/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        notify(data.error ?? 'Failed to save', 'err')
        return
      }
      const updated = (await res.json()) as UserData
      setUser(updated)
      setNewPassword('')
      notify('User saved', 'ok')
    } catch {
      notify('Network error', 'err')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate() {
    setDeactivating(true)
    try {
      const res = await fetch(`/api/settings/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      })
      if (!res.ok) {
        notify('Failed to deactivate user', 'err')
        return
      }
      setIsActive(false)
      setShowDeactivateConfirm(false)
      notify('User deactivated', 'ok')
      setTimeout(() => router.push('/settings/users'), 800)
    } catch {
      notify('Network error', 'err')
    } finally {
      setDeactivating(false)
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="Edit User" breadcrumb={[{ label: 'Settings', href: '/settings' }, { label: 'Users', href: '/settings/users' }]} />
        <main className="flex-1 flex items-center justify-center bg-[#0f0f1a] min-h-[100dvh]">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </main>
      </>
    )
  }

  if (fetchError || !user) {
    return (
      <>
        <TopBar title="Edit User" breadcrumb={[{ label: 'Settings', href: '/settings' }, { label: 'Users', href: '/settings/users' }]} />
        <main className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#0f0f1a] min-h-[100dvh] text-zinc-500">
          <AlertTriangle className="w-8 h-8 text-amber-500 opacity-70" />
          <p className="text-[13px]">{fetchError ?? 'User not found'}</p>
          <Link href="/settings/users" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to Users
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      <TopBar
        title="Edit User"
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
              className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-medium shadow-xl ${
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

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[18px] font-semibold text-zinc-100">{user.name}</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5 font-mono">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${ROLE_BADGE[user.role] ?? 'bg-zinc-700 text-zinc-400'}`}>
                {user.role}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${user.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">

            {/* Core fields */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Account Details</p>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500" htmlFor="edit-name">
                  Full Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500" htmlFor="edit-email">
                  Email Address
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500" htmlFor="edit-role">
                  Role
                </label>
                <select
                  id="edit-role"
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40">
                <div>
                  <p className="text-[13px] font-medium text-zinc-200">Account Active</p>
                  <p className="text-[11px] text-zinc-500">Inactive users cannot sign in</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(v => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    isActive ? 'bg-emerald-600' : 'bg-zinc-700'
                  }`}
                  role="switch"
                  aria-checked={isActive}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                      isActive ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Store (read-only — set via Employee record) */}
              {user.employee?.store && (
                <div className="pt-2 border-t border-zinc-800/40">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">Store</p>
                  <p className="text-[13px] text-zinc-300">{user.employee.store.name}</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">Store assignment is managed via the HR → Employees module</p>
                </div>
              )}
            </div>

            {/* Change password */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Change Password</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">Leave blank to keep the current password</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500" htmlFor="new-password">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
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
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-between">
              {/* Deactivate (only if active) */}
              {isActive && (
                <div className="flex items-center gap-2">
                  {showDeactivateConfirm ? (
                    <>
                      <span className="text-[12px] text-amber-400">Are you sure? This user will lose access.</span>
                      <button
                        type="button"
                        onClick={handleDeactivate}
                        disabled={deactivating}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400 text-[12px] font-medium transition-colors disabled:opacity-50"
                      >
                        {deactivating && <Loader2 className="w-3 h-3 animate-spin" />}
                        Confirm Deactivate
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeactivateConfirm(false)}
                        className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDeactivateConfirm(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-800/50 text-red-400 hover:bg-red-500/10 text-[12px] font-medium transition-colors"
                    >
                      Deactivate User
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 ml-auto">
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
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>

          </form>
        </div>
      </main>
    </>
  )
}
