'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HeadphonesIcon } from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
}

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export default function NewCasePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customersLoading, setCustomersLoading] = useState(true)

  const [customerId, setCustomerId] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/customers')
      .then(r => r.json())
      .then((data: Customer[]) => {
        setCustomers(data)
        if (data.length > 0) setCustomerId(data[0].id)
      })
      .catch(() => setError('Failed to load customers.'))
      .finally(() => setCustomersLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customerId) { setError('Please select a customer.'); return }
    if (!subject.trim()) { setError('Subject is required.'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/service/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          subject: subject.trim(),
          description: description.trim() || undefined,
          priority,
          category: category.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to create case.')
        return
      }
      const created = await res.json()
      router.push(`/service/${created.id}`)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="New Support Case" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6 pb-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <HeadphonesIcon className="w-5 h-5 text-zinc-400" />
                <h2 className="text-base font-semibold text-zinc-100">Create Support Case</h2>
              </div>

              {error && (
                <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Customer */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    Customer *
                  </label>
                  {customersLoading ? (
                    <p className="text-sm text-zinc-500">Loading customers…</p>
                  ) : (
                    <select
                      value={customerId}
                      onChange={e => setCustomerId(e.target.value)}
                      required
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select customer…</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName}
                          {c.email ? ` — ${c.email}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                    placeholder="Brief description of the issue"
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Full details of the issue, steps to reproduce, impact…"
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Priority + Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {PRIORITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      placeholder="e.g. Billing, Technical, Returns"
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={loading || customersLoading}>
                    {loading ? 'Creating…' : 'Create Case'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/service')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
