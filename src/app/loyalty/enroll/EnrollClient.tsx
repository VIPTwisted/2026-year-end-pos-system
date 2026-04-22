'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck } from 'lucide-react'

type Customer = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

type Tier = {
  id: string
  name: string
  minimumPoints: number
  color: string | null
}

type Program = {
  id: string
  name: string
  tiers: Tier[]
}

interface Props {
  customers: Customer[]
  programs: Program[]
}

export function EnrollClient({ customers, programs }: Props) {
  const router = useRouter()
  const [customerId, setCustomerId] = useState('')
  const [programId, setProgramId] = useState(programs[0]?.id ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const selectedProgram = programs.find(p => p.id === programId)

  const filteredCustomers = customers.filter(c => {
    const q = search.toLowerCase()
    return !q || `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || (c.email ?? '').toLowerCase().includes(q)
  })

  async function enroll() {
    if (!customerId || !programId) { setError('Select a customer and program'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/loyalty/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, programId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Enrollment failed')
      }
      const card = await res.json()
      router.push(`/loyalty/cards/${card.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Enrollment failed')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-[13px] text-red-400">{error}</div>
      )}

      {/* Program Select */}
      <div>
        <label className="block text-[11px] text-zinc-400 uppercase tracking-wide mb-1.5">Loyalty Program *</label>
        <select
          value={programId}
          onChange={e => setProgramId(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
        >
          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {selectedProgram && selectedProgram.tiers.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {selectedProgram.tiers.map(t => (
              <span key={t.id} className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 px-2 py-0.5 bg-zinc-800 rounded-full">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color ?? '#71717a' }} />
                {t.name} ({t.minimumPoints.toLocaleString()} pts)
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Customer Select */}
      <div>
        <label className="block text-[11px] text-zinc-400 uppercase tracking-wide mb-1.5">
          Customer * <span className="normal-case text-zinc-600 font-normal">({customers.length} eligible)</span>
        </label>
        {customers.length === 0 ? (
          <div className="bg-zinc-800 border border-zinc-700 rounded px-3 py-4 text-[13px] text-zinc-500 text-center">
            All active customers are already enrolled in a loyalty program.
          </div>
        ) : (
          <>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors mb-2"
            />
            <div className="bg-zinc-800 border border-zinc-700 rounded overflow-hidden max-h-56 overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <div className="px-3 py-4 text-[13px] text-zinc-500 text-center">No customers match your search</div>
              ) : (
                filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCustomerId(c.id)}
                    className={`w-full text-left px-3 py-2.5 transition-colors flex items-center justify-between ${
                      customerId === c.id
                        ? 'bg-blue-600/20 text-blue-300 border-l-2 border-blue-500'
                        : 'text-zinc-300 hover:bg-zinc-700/60'
                    }`}
                  >
                    <div>
                      <div className="text-[13px] font-medium">{c.firstName} {c.lastName}</div>
                      {c.email && <div className="text-[11px] text-zinc-500">{c.email}</div>}
                    </div>
                    {customerId === c.id && <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Card Number Preview */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded px-4 py-3">
        <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Card Number</p>
        <p className="text-[13px] font-mono text-zinc-400">Auto-generated on enrollment</p>
      </div>

      <button
        onClick={enroll}
        disabled={saving || !customerId || !programId || customers.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] h-10 px-4 rounded transition-colors font-medium flex items-center justify-center gap-2"
      >
        <UserCheck className="w-4 h-4" />
        {saving ? 'Enrolling...' : 'Enroll Customer'}
      </button>
    </div>
  )
}
