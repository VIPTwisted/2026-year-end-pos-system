'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

interface Employee {
  id: string
  firstName: string
  lastName: string
  position: string
}

const ROLES = ['cashier', 'manager', 'warehouse', 'accountant', 'admin', 'Sales Associate', 'Floor Supervisor']
const CATEGORIES = ['Electronics', 'Clothing', 'Food & Beverage', 'Home Goods', 'Accessories', 'Software']

export default function NewCommissionRatePage() {
  const router = useRouter()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)

  const [employeeId, setEmployeeId] = useState('')
  const [role, setRole] = useState('')
  const [ratePct, setRatePct] = useState('')
  const [productCategory, setProductCategory] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/hr/employees')
      .then(r => r.json())
      .then((d: unknown) => {
        const list = Array.isArray(d) ? d : (d as { employees?: Employee[] }).employees ?? []
        setEmployees(list as Employee[])
      })
      .catch(() => setEmployees([]))
      .finally(() => setLoadingEmployees(false))
  }, [])

  function notify(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const rateNum = parseFloat(ratePct)
    if (isNaN(rateNum) || rateNum <= 0 || rateNum > 100) {
      setError('Rate must be between 0.01 and 100')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/hr/commission-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(employeeId ? { employeeId } : {}),
          ...(role ? { role } : {}),
          rate: rateNum / 100,
          ...(productCategory ? { productCategory } : {}),
        }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Failed to create rate')
        return
      }

      notify('Commission rate created')
      setTimeout(() => router.push('/hr/commissions/rates'), 800)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Commission Rate" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">

        {toast && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm shadow-lg">
            {toast}
          </div>
        )}

        <div className="max-w-lg mx-auto mt-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <h2 className="text-base font-semibold text-zinc-100 mb-1">Add Commission Rate</h2>
            <p className="text-[13px] text-zinc-500 mb-6">
              Leave Employee blank to apply rate to a role, or leave both blank for a global rate.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Employee */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Employee <span className="text-zinc-600 normal-case">(optional — leave blank for role/global)</span>
                </label>
                <select
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  disabled={loadingEmployees}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">— All Employees —</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.position})
                    </option>
                  ))}
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Role / Position <span className="text-zinc-600 normal-case">(optional)</span>
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">— All Roles —</option>
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Rate */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Commission Rate %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    required
                    value={ratePct}
                    onChange={e => setRatePct(e.target.value)}
                    placeholder="e.g. 5 for 5%"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 pr-8 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">%</span>
                </div>
              </div>

              {/* Product Category */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Product Category <span className="text-zinc-600 normal-case">(optional)</span>
                </label>
                <select
                  value={productCategory}
                  onChange={e => setProductCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">— All Categories —</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="px-3 py-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  {saving ? 'Saving…' : 'Create Rate'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/hr/commissions/rates')}
                  className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
