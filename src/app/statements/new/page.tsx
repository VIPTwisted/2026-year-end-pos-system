'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function NewStatementPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [storeId, setStoreId] = useState('')
  const [channelId, setChannelId] = useState('')
  const [fiscalPeriod, setFiscalPeriod] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!startDate || !endDate) { setError('Start and end dates are required'); return }
    if (new Date(startDate) > new Date(endDate)) { setError('Start date must be before end date'); return }
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/statements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: storeId.trim() || undefined,
          channelId: channelId.trim() || undefined,
          fiscalPeriod: fiscalPeriod.trim() || undefined,
          startDate,
          endDate,
          notes: notes.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      router.push(`/statements/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create statement')
      setSaving(false)
    }
  }

  function fillToday() {
    const now = new Date()
    const start = new Date(now); start.setHours(0, 0, 0, 0)
    const end = new Date(now); end.setHours(23, 59, 59, 0)
    setStartDate(start.toISOString().slice(0, 16))
    setEndDate(end.toISOString().slice(0, 16))
  }

  function fillThisMonth() {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59)
    setStartDate(start.toISOString().slice(0, 16))
    setEndDate(end.toISOString().slice(0, 16))
  }

  return (
    <>
      <TopBar title="New Statement" />
      <main className="flex-1 p-6 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          <Card>
            <CardContent className="pt-6 space-y-5">
              <h2 className="text-base font-semibold text-zinc-100">Statement Details</h2>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={fillToday}>Today</Button>
                <Button type="button" variant="outline" size="sm" onClick={fillThisMonth}>This Month</Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Start Date & Time *</label>
                  <Input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">End Date & Time *</label>
                  <Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Store ID</label>
                  <Input value={storeId} onChange={e => setStoreId(e.target.value)} placeholder="Store ID" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Channel ID</label>
                  <Input value={channelId} onChange={e => setChannelId(e.target.value)} placeholder="Channel ID" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Fiscal Period</label>
                <Input value={fiscalPeriod} onChange={e => setFiscalPeriod(e.target.value)} placeholder="e.g. FY2026-P04" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional notes..."
                  className="flex w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Statement'}</Button>
          </div>
        </form>
      </main>
    </>
  )
}
