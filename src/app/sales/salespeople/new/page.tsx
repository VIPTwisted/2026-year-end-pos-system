'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

interface Territory {
  id: string
  code: string
  name: string
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  position: string
}

export default function NewSalespersonPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [territories, setTerritories] = useState<Territory[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const [form, setForm] = useState({
    code: '',
    name: '',
    email: '',
    phone: '',
    territoryId: '',
    employeeId: '',
    commissionPct: '0',
    isActive: true,
  })

  useEffect(() => {
    fetch('/api/sales/territories')
      .then(r => r.json())
      .then(d => setTerritories(Array.isArray(d) ? d : []))
      .catch(() => {})

    fetch('/api/hr/employees')
      .then(r => r.json())
      .then(d => setEmployees(Array.isArray(d) ? d : (d.employees ?? [])))
      .catch(() => {})
  }, [])

  const set = (field: keyof typeof form, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code.trim() || !form.name.trim()) {
      setError('Code and name are required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/sales/salespeople', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          territoryId: form.territoryId || null,
          employeeId: form.employeeId || null,
          commissionPct: parseFloat(form.commissionPct) || 0,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to create')
      }
      notify('Salesperson created')
      setTimeout(() => router.push('/sales/salespeople'), 800)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      notify(msg, 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded text-sm font-medium shadow-lg ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <TopBar
        title="New Salesperson"
        showBack
        breadcrumb={[
          { label: 'Sales', href: '/sales/salespeople' },
          { label: 'Salespeople', href: '/sales/salespeople' },
        ]}
      />

      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-zinc-200 mb-6">Salesperson Details</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Code *
                </label>
                <input
                  value={form.code}
                  onChange={e => set('code', e.target.value.toUpperCase())}
                  placeholder="JD"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Full Name *
                </label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="jane@store.com"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Phone
                </label>
                <input
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Territory
                </label>
                <select
                  value={form.territoryId}
                  onChange={e => set('territoryId', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">— None —</option>
                  {territories.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.code} — {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Linked Employee (optional)
                </label>
                <select
                  value={form.employeeId}
                  onChange={e => set('employeeId', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">— None —</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} — {emp.position}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                Commission %
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.commissionPct}
                onChange={e => set('commissionPct', e.target.value)}
                placeholder="5.00"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={e => set('isActive', e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <label htmlFor="isActive" className="text-sm text-zinc-300">Active</label>
            </div>

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
              >
                {saving ? 'Creating…' : 'Create Salesperson'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
