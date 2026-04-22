'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

interface CustomerResult {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  position: string
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

export default function NewServiceOrderPage() {
  const router = useRouter()

  // Customer search
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState<CustomerResult[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResult | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Employees
  const [employees, setEmployees] = useState<Employee[]>([])

  // Form fields
  const [technicianId, setTechnicianId] = useState('')
  const [deviceType, setDeviceType] = useState('')
  const [deviceSerial, setDeviceSerial] = useState('')
  const [issueReported, setIssueReported] = useState('')
  const [priority, setPriority] = useState('normal')
  const [estimatedDays, setEstimatedDays] = useState('')
  const [depositPaid, setDepositPaid] = useState('')
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  useEffect(() => {
    fetch('/api/hr/employees')
      .then(r => r.json())
      .then((data: Employee[]) => setEmployees(data))
      .catch(() => notify('Failed to load employees', 'err'))
  }, [])

  useEffect(() => {
    if (!customerQuery.trim()) {
      setCustomerResults([])
      return
    }
    const timer = setTimeout(() => {
      fetch(`/api/customers?search=${encodeURIComponent(customerQuery)}&limit=8`)
        .then(r => r.json())
        .then(d => setCustomerResults(d.customers ?? []))
        .catch(() => {})
    }, 250)
    return () => clearTimeout(timer)
  }, [customerQuery])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!issueReported.trim()) {
      notify('Issue description is required', 'err')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer?.id ?? null,
          technicianId: technicianId || null,
          deviceType: deviceType.trim() || null,
          deviceSerial: deviceSerial.trim() || null,
          issueReported: issueReported.trim(),
          priority,
          estimatedDays: estimatedDays ? parseInt(estimatedDays) : null,
          depositPaid: depositPaid ? parseFloat(depositPaid) : 0,
          notes: notes.trim() || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to create service order')
      }
      const order = await res.json()
      router.push(`/service-orders/${order.id}`)
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to create service order', 'err')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
      <TopBar
        title="New Service Order"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Service Orders', href: '/service-orders' },
        ]}
        showBack
      />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded text-sm font-medium shadow-lg ${
          toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-3xl mx-auto w-full p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Search */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Customer</h2>

            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 bg-zinc-800/40 rounded border border-zinc-700/50">
                <div>
                  <p className="text-sm font-medium text-zinc-100">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </p>
                  <p className="text-xs text-zinc-500">{selectedCustomer.email} · {selectedCustomer.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedCustomer(null); setCustomerQuery('') }}
                  className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div ref={searchRef} className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={customerQuery}
                  onChange={e => { setCustomerQuery(e.target.value); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none"
                />
                {showDropdown && customerResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#16213e] border border-zinc-700 rounded shadow-xl z-50 max-h-48 overflow-y-auto">
                    {customerResults.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelectedCustomer(c); setCustomerQuery(''); setShowDropdown(false) }}
                        className="w-full text-left px-3 py-2.5 hover:bg-zinc-800/60 transition-colors border-b border-zinc-800/40 last:border-0"
                      >
                        <p className="text-sm text-zinc-100">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-zinc-500">{c.email}</p>
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-zinc-600 mt-1">Leave blank for walk-in customers</p>
              </div>
            )}
          </div>

          {/* Device Info */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Device Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Device Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 14, Dell XPS 15"
                  value={deviceType}
                  onChange={e => setDeviceType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Serial / IMEI
                </label>
                <input
                  type="text"
                  placeholder="Device serial number"
                  value={deviceSerial}
                  onChange={e => setDeviceSerial(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Issue + Details */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Issue Details</h2>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Issue Reported <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe the problem reported by the customer..."
                value={issueReported}
                onChange={e => setIssueReported(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Technician
                </label>
                <select
                  value={technicianId}
                  onChange={e => setTechnicianId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 outline-none"
                >
                  <option value="">Unassigned</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Est. Days
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 3"
                  value={estimatedDays}
                  onChange={e => setEstimatedDays(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Deposit Paid ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={depositPaid}
                  onChange={e => setDepositPaid(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Internal notes..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Service Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
