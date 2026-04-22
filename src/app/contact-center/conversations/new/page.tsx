'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Channel = { id: string; name: string; type: string }
type Customer = { id: string; firstName: string; lastName: string; email: string | null }

export default function NewConversationPage() {
  const router = useRouter()
  const [channels, setChannels] = useState<Channel[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    channelId: '',
    customerId: '',
    direction: 'outbound',
    subject: '',
    notes: '',
    agentName: '',
  })

  useEffect(() => {
    fetch('/api/contact-center/channels').then(r => r.json()).then(setChannels)
  }, [])

  useEffect(() => {
    if (customerSearch.length < 2) { setCustomers([]); return }
    fetch(`/api/customers?q=${encodeURIComponent(customerSearch)}`).then(r => r.json()).then((data: Customer[]) => {
      setCustomers(Array.isArray(data) ? data.slice(0, 10) : [])
    })
  }, [customerSearch])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.channelId) { setError('Channel is required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact-center/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      const conv = await res.json()
      router.push(`/contact-center/conversations/${conv.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <h1 className="text-xl font-bold mb-6 text-zinc-100">New Outbound Conversation</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Channel */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Channel *</label>
          <select
            value={form.channelId}
            onChange={e => setForm(f => ({ ...f, channelId: e.target.value }))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select channel...</option>
            {channels.map(ch => (
              <option key={ch.id} value={ch.id}>{ch.name} ({ch.type})</option>
            ))}
          </select>
        </div>

        {/* Customer */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Customer</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={customerSearch}
            onChange={e => setCustomerSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1"
          />
          {customers.length > 0 && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
              {customers.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setForm(f => ({ ...f, customerId: c.id }))
                    setCustomerSearch(`${c.firstName} ${c.lastName}`)
                    setCustomers([])
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 transition-colors ${form.customerId === c.id ? 'bg-blue-600/20 text-blue-300' : 'text-zinc-300'}`}
                >
                  {c.firstName} {c.lastName} {c.email ? `— ${c.email}` : ''}
                </button>
              ))}
            </div>
          )}
          {form.customerId && (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-emerald-400">Customer selected</span>
              <button
                type="button"
                onClick={() => { setForm(f => ({ ...f, customerId: '' })); setCustomerSearch('') }}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Direction */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Direction</label>
          <div className="flex gap-3">
            {['inbound', 'outbound'].map(d => (
              <label key={d} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  value={d}
                  checked={form.direction === d}
                  onChange={() => setForm(f => ({ ...f, direction: d }))}
                  className="accent-blue-500"
                />
                <span className="text-sm text-zinc-300 capitalize">{d}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Agent */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Assign to Agent</label>
          <input
            type="text"
            placeholder="Agent name..."
            value={form.agentName}
            onChange={e => setForm(f => ({ ...f, agentName: e.target.value }))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Subject</label>
          <input
            type="text"
            placeholder="Brief subject..."
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Notes</label>
          <textarea
            placeholder="Initial notes..."
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : 'Create Conversation'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
