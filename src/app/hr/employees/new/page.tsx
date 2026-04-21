'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type Store = { id: string; name: string }

export default function NewEmployeePage() {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    department: '',
    storeId: '',
    hireDate: new Date().toISOString().slice(0, 10),
    hourlyRate: '',
  })

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then((data: Store[]) => setStores(data))
      .catch(() => setError('Failed to load stores'))
  }, [])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      position: form.position.trim(),
      department: form.department.trim() || undefined,
      storeId: form.storeId,
      hireDate: form.hireDate || undefined,
      hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
    }

    try {
      const res = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? 'Failed to create employee')
      }

      router.push('/hr/employees')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  const inputCls =
    'w-full rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm px-3 py-2 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500'
  const labelCls = 'block text-xs text-zinc-500 uppercase tracking-wide mb-1'

  return (
    <>
      <TopBar title="Hire Employee" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div>
          <Link
            href="/hr/employees"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Employees
          </Link>
        </div>

        <Card className="max-w-2xl">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-base font-semibold text-zinc-100 mb-6">New Employee</h2>

            {error && (
              <div className="mb-4 rounded-md bg-red-900/30 border border-red-700 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className={labelCls}>First Name *</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={form.firstName}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelCls}>Last Name *</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={form.lastName}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Smith"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className={labelCls}>Email Address *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="jane.smith@example.com"
                />
                <p className="mt-1 text-xs text-zinc-600">
                  Used for login. Default password: <span className="font-mono">Welcome1!</span>
                </p>
              </div>

              {/* Position + Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="position" className={labelCls}>Position *</label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    required
                    value={form.position}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Cashier"
                  />
                </div>
                <div>
                  <label htmlFor="department" className={labelCls}>Department</label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={form.department}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Sales"
                  />
                </div>
              </div>

              {/* Store */}
              <div>
                <label htmlFor="storeId" className={labelCls}>Store *</label>
                <select
                  id="storeId"
                  name="storeId"
                  required
                  value={form.storeId}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">Select a store…</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Hire Date + Hourly Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hireDate" className={labelCls}>Hire Date</label>
                  <input
                    id="hireDate"
                    name="hireDate"
                    type="date"
                    value={form.hireDate}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="hourlyRate" className={labelCls}>Hourly Rate ($)</label>
                  <input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.hourlyRate}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="18.00"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Hiring…' : 'Hire Employee'}
                </Button>
                <Link href="/hr/employees">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

      </main>
    </>
  )
}
