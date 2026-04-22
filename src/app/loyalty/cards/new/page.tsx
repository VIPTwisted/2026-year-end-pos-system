'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, Star } from 'lucide-react'

type Customer = { id: string; firstName: string; lastName: string; email: string | null }
type Program = { id: string; name: string }

function generateCardNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let num = 'LC-'
  for (let i = 0; i < 10; i++) num += chars[Math.floor(Math.random() * chars.length)]
  return num
}

export default function NewLoyaltyCardPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [search, setSearch] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [programId, setProgramId] = useState('')
  const [cardNumber, setCardNumber] = useState(generateCardNumber())
  const [enrolledAt, setEnrolledAt] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers)
    fetch('/api/loyalty/programs').then(r => r.json()).then((data: Program[]) => {
      setPrograms(data)
      if (data.length > 0) setProgramId(data[0].id)
    })
  }, [])

  const filtered = customers.filter(c =>
    `${c.firstName} ${c.lastName} ${c.email ?? ''}`.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customerId) { setError('Please select a customer'); return }
    if (!programId) { setError('Please select a program'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/loyalty/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, programId, cardNumber, enrolledAt }),
    })
    if (res.ok) {
      const card = await res.json()
      router.push(`/loyalty/cards/${card.id}`)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to create card')
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="Enroll New Member" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-xl">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-zinc-100">New Loyalty Card</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Customer selector */}
                <div>
                  <Label className="text-zinc-300 mb-1 block">Customer</Label>
                  <Input
                    placeholder="Search customers..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mb-2"
                  />
                  <div className="max-h-48 overflow-y-auto border border-zinc-700 rounded-lg divide-y divide-zinc-800">
                    {filtered.slice(0, 30).map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setCustomerId(c.id); setSearch(`${c.firstName} ${c.lastName}`) }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${customerId === c.id ? 'bg-blue-600/20 text-blue-300' : 'text-zinc-300 hover:bg-zinc-800'}`}
                      >
                        <span className="font-medium">{c.firstName} {c.lastName}</span>
                        {c.email && <span className="text-zinc-500 ml-2 text-xs">{c.email}</span>}
                      </button>
                    ))}
                    {filtered.length === 0 && (
                      <p className="px-3 py-4 text-zinc-600 text-sm text-center">No customers found</p>
                    )}
                  </div>
                </div>

                {/* Program */}
                <div>
                  <Label className="text-zinc-300 mb-1 block">Program</Label>
                  <select
                    value={programId}
                    onChange={e => setProgramId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm"
                    required
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Card Number */}
                <div>
                  <Label className="text-zinc-300 mb-1 block">Card Number</Label>
                  <div className="flex gap-2">
                    <Input
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCardNumber(generateCardNumber())}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Enrolled At */}
                <div>
                  <Label className="text-zinc-300 mb-1 block">Enrolled Date</Label>
                  <Input
                    type="date"
                    value={enrolledAt}
                    onChange={e => setEnrolledAt(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Enrolling...' : 'Enroll Member'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
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
