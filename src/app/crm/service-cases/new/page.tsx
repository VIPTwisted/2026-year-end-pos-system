'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface Employee {
  id: string
  firstName: string
  lastName: string
}

export default function NewServiceCasePage() {
  const router = useRouter()

  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers]           = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDropdown, setShowDropdown]     = useState(false)
  const [employees, setEmployees]           = useState<Employee[]>([])

  const [subject, setSubject]         = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority]       = useState('normal')
  const [assignedToId, setAssignedToId] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch employees
  useEffect(() => {
    fetch('/api/hr/employees')
      .then(r => r.ok ? r.json() : [])
      .then((data: Employee[]) => {
        setEmployees(Array.isArray(data) ? data : [])
      })
      .catch(() => setEmployees([]))
  }, [])

  // Debounced customer search
  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomers([])
      setShowDropdown(false)
      return
    }
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => {
      fetch(`/api/customers?search=${encodeURIComponent(customerSearch)}`)
        .then(r => r.ok ? r.json() : { customers: [] })
        .then((data: { customers: Customer[] } | Customer[]) => {
          const list = Array.isArray(data) ? data : data.customers ?? []
          setCustomers(list)
          setShowDropdown(list.length > 0)
        })
        .catch(() => setCustomers([]))
    }, 300)
  }, [customerSearch])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCustomer) { setError('Please select a customer'); return }
    if (!subject.trim())   { setError('Subject is required'); return }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/crm/service-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          subject: subject.trim(),
          description: description.trim() || undefined,
          priority,
          assignedToId: assignedToId || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Failed to create case')
        return
      }

      const created = await res.json() as { id: string }
      router.push(`/crm/service-cases/${created.id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <TopBar title="New Service Case" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-2xl mx-auto">

          {/* Back link */}
          <Link
            href="/crm/service-cases"
            className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Service Cases
          </Link>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <h2 className="text-base font-semibold text-zinc-100 mb-5">Create Service Case</h2>

            {error && (
              <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Customer search */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Customer *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={selectedCustomer
                      ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                      : customerSearch}
                    onChange={e => {
                      setSelectedCustomer(null)
                      setCustomerSearch(e.target.value)
                    }}
                    onFocus={() => { if (customers.length > 0) setShowDropdown(true) }}
                    placeholder="Search by name or email…"
                    className="w-full pl-8 pr-3 h-9 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                  />
                  {showDropdown && customers.length > 0 && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-zinc-900 border border-zinc-700 rounded shadow-lg max-h-52 overflow-y-auto">
                      {customers.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(c)
                            setCustomerSearch('')
                            setShowDropdown(false)
                          }}
                          className="w-full text-left px-3 py-2 text-[13px] text-zinc-200 hover:bg-zinc-800 transition-colors"
                        >
                          <span className="font-medium">{c.firstName} {c.lastName}</span>
                          {c.email && <span className="text-zinc-500 ml-2">{c.email}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedCustomer && (
                  <p className="mt-1 text-[11px] text-emerald-400">
                    Selected: {selectedCustomer.firstName} {selectedCustomer.lastName}
                    {selectedCustomer.email && ` · ${selectedCustomer.email}`}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Briefly describe the issue"
                  required
                  className="w-full px-3 h-9 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Detailed description of the issue…"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full px-3 h-9 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Assigned To
                </label>
                <select
                  value={assignedToId}
                  onChange={e => setAssignedToId(e.target.value)}
                  className="w-full px-3 h-9 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">— Unassigned —</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] h-9 px-5 rounded font-medium transition-colors"
                >
                  {submitting ? 'Creating…' : 'Create Case'}
                </button>
                <Link
                  href="/crm/service-cases"
                  className="text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
