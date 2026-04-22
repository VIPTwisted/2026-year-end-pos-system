'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'

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

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  totalSpent: number
  isActive: boolean
}

interface Salesperson {
  id: string
  code: string
  name: string
  email: string | null
  phone: string | null
  commissionPct: number
  ytdSales: number
  ytdCommission: number
  isActive: boolean
  createdAt: string
  territory: Territory | null
  employee: Employee | null
  customers: Customer[]
  employeeId: string | null
}

interface MonthlyData {
  month: number
  total: number
}

interface PerformanceData {
  monthlyData: MonthlyData[]
  ytdTotal: number
  year: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function SalespersonDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [sp, setSp] = useState<Salesperson | null>(null)
  const [perf, setPerf] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    commissionPct: '0',
    isActive: true,
  })

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  useEffect(() => {
    const id = params.id
    if (!id) return
    Promise.all([
      fetch(`/api/sales/salespeople/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/sales/salespeople/${id}/performance`).then(r => r.ok ? r.json() : null),
    ])
      .then(([spData, perfData]) => {
        if (spData) {
          setSp(spData)
          setForm({
            name: spData.name,
            email: spData.email ?? '',
            phone: spData.phone ?? '',
            commissionPct: String(Number(spData.commissionPct)),
            isActive: spData.isActive,
          })
        }
        if (perfData) setPerf(perfData)
      })
      .catch(() => notify('Failed to load', 'err'))
      .finally(() => setLoading(false))
  }, [params.id])

  async function handleSave() {
    if (!sp) return
    setSaving(true)
    try {
      const res = await fetch(`/api/sales/salespeople/${sp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          commissionPct: parseFloat(form.commissionPct) || 0,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const updated = await res.json()
      setSp(prev => prev ? { ...prev, ...updated } : null)
      setEditing(false)
      notify('Saved')
    } catch {
      notify('Failed to save', 'err')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!sp) return
    try {
      const res = await fetch(`/api/sales/salespeople/${sp.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      notify('Deleted')
      setTimeout(() => router.push('/sales/salespeople'), 800)
    } catch {
      notify('Failed to delete', 'err')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading…</div>
      </div>
    )
  }

  if (!sp) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Salesperson not found.</div>
      </div>
    )
  }

  const maxBar = perf ? Math.max(...perf.monthlyData.map(m => m.total), 1) : 1
  const currentMonth = new Date().getMonth() + 1

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded text-sm font-medium shadow-lg ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">Delete Salesperson</h3>
            <p className="text-sm text-zinc-400">
              Delete <span className="text-zinc-100 font-medium">{sp.name}</span>? This cannot be undone.
              Customer assignments will be cleared.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <TopBar
        title={sp.name}
        showBack
        breadcrumb={[
          { label: 'Sales', href: '/sales/salespeople' },
          { label: 'Salespeople', href: '/sales/salespeople' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        }
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{sp.code}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${sp.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                  {sp.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">{sp.name}</h2>
              {sp.territory && (
                <p className="text-sm text-zinc-400 mt-0.5">
                  Territory:{' '}
                  <Link href="/sales/territories" className="text-blue-400/80 hover:text-blue-400">
                    {sp.territory.code} — {sp.territory.name}
                  </Link>
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-6 text-right">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Comm %</div>
                <div className="text-lg font-bold text-zinc-100 tabular-nums">{Number(sp.commissionPct).toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">YTD Sales</div>
                <div className="text-lg font-bold text-zinc-100 tabular-nums">{formatCurrency(Number(sp.ytdSales))}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">YTD Commission</div>
                <div className="text-lg font-bold text-amber-400 tabular-nums">{formatCurrency(Number(sp.ytdCommission))}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info / Edit */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Contact Info</h3>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Phone</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Commission %</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={form.commissionPct}
                    onChange={e => setForm(p => ({ ...p, commissionPct: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editActive"
                    checked={form.isActive}
                    onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <label htmlFor="editActive" className="text-sm text-zinc-300">Active</label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <InfoRow label="Email" value={sp.email ?? '—'} />
                <InfoRow label="Phone" value={sp.phone ?? '—'} />
                {sp.employee && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">Employee</div>
                    <Link href={`/hr/employees/${sp.employeeId}`} className="text-sm text-blue-400 hover:text-blue-300">
                      {sp.employee.firstName} {sp.employee.lastName}
                    </Link>
                    <div className="text-xs text-zinc-500">{sp.employee.position}</div>
                  </div>
                )}
                <InfoRow label="Member Since" value={new Date(sp.createdAt).toLocaleDateString()} />
              </div>
            )}
          </div>

          {/* Performance chart */}
          <div className="lg:col-span-2 bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Monthly Sales {perf?.year}</h3>
              {perf && (
                <span className="text-xs text-zinc-400 tabular-nums">
                  YTD: <span className="text-zinc-100 font-semibold">{formatCurrency(perf.ytdTotal)}</span>
                </span>
              )}
            </div>

            {perf ? (
              <div className="flex items-end gap-1.5 h-40">
                {perf.monthlyData.map(m => {
                  const heightPct = maxBar > 0 ? (m.total / maxBar) * 100 : 0
                  const isCurrentMonth = m.month === currentMonth
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex items-end justify-center" style={{ height: '128px' }}>
                        <div
                          className={`w-full rounded-t transition-all duration-200 ${isCurrentMonth ? 'bg-blue-500' : 'bg-zinc-700 group-hover:bg-zinc-600'}`}
                          style={{ height: `${Math.max(heightPct, m.total > 0 ? 4 : 0)}%` }}
                          title={`${MONTHS[m.month - 1]}: ${formatCurrency(m.total)}`}
                        />
                        {m.total > 0 && (
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-100 whitespace-nowrap z-10">
                            {formatCurrency(m.total)}
                          </div>
                        )}
                      </div>
                      <span className={`text-[9px] font-medium ${isCurrentMonth ? 'text-blue-400' : 'text-zinc-600'}`}>
                        {MONTHS[m.month - 1]}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">
                No performance data
              </div>
            )}
          </div>
        </div>

        {/* Assigned customers */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Assigned Customers ({sp.customers.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Email</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Phone</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total Spent</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {sp.customers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-zinc-500 text-sm">
                      No customers assigned
                    </td>
                  </tr>
                )}
                {sp.customers.map(c => (
                  <tr key={c.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/customers/${c.id}`} className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{c.email ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{c.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-zinc-200 text-right tabular-nums font-semibold">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${c.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">{label}</div>
      <div className="text-sm text-zinc-300">{value}</div>
    </div>
  )
}
