'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Megaphone } from 'lucide-react'

const TYPE_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'social', label: 'Social' },
  { value: 'push', label: 'Push Notification' },
]

export default function NewCampaignPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [type, setType] = useState('email')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [budget, setBudget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Campaign name is required.'); return }
    if (!type) { setError('Campaign type is required.'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          subject: subject.trim() || undefined,
          content: content.trim() || undefined,
          budget: budget ? parseFloat(budget) : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to create campaign.')
        return
      }
      const created = await res.json()
      router.push(`/marketing/${created.id}`)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="New Campaign" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6 pb-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Megaphone className="w-5 h-5 text-zinc-400" />
                <h2 className="text-base font-semibold text-zinc-100">Create Campaign</h2>
              </div>

              {error && (
                <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name + Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="e.g. Spring Sale 2026"
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                      Type *
                    </label>
                    <select
                      value={type}
                      onChange={e => setType(e.target.value)}
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    Subject / Headline
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Email subject line or message headline"
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    Content / Message Body
                  </label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={6}
                    placeholder="Campaign message body or content notes…"
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Budget + Dates */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                      Budget ($)
                    </label>
                    <input
                      type="number"
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Campaign'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/marketing')}
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
