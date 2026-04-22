'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Radio, TimerOff, Pencil, X, Save, Trash2 } from 'lucide-react'

const CHANNELS = ['Online Store', 'POS Terminal', 'Mobile App', 'Wholesale', 'Kiosk', 'B2B Portal']

type LineInfo = { id: string; productId?: string; lineType: string }

export function AssortmentDetailClient({
  id,
  status,
  name: initialName,
  description: initialDesc,
  startDate: initialStart,
  endDate: initialEnd,
  channelIds: initialChannels,
  lineIds,
}: {
  id: string
  status: string
  name: string
  description: string
  startDate: string
  endDate: string
  channelIds: string[]
  lineIds: LineInfo[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)

  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDesc)
  const [startDate, setStartDate] = useState(initialStart)
  const [endDate, setEndDate] = useState(initialEnd)
  const [channels, setChannels] = useState<string[]>(initialChannels)

  async function publish() {
    setBusy(true)
    await fetch(`/api/assortments/${id}/publish`, { method: 'POST' })
    setBusy(false)
    router.refresh()
  }

  async function expire() {
    setBusy(true)
    await fetch(`/api/assortments/${id}/expire`, { method: 'POST' })
    setBusy(false)
    router.refresh()
  }

  async function save() {
    setBusy(true)
    await fetch(`/api/assortments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        channels,
        lines: lineIds.map(l => ({ productId: l.productId, lineType: l.lineType })),
      }),
    })
    setBusy(false)
    setEditing(false)
    router.refresh()
  }

  async function deleteAssortment() {
    if (!confirm('Delete this assortment? This cannot be undone.')) return
    setBusy(true)
    await fetch(`/api/assortments/${id}`, { method: 'DELETE' })
    router.push('/assortments')
  }

  function toggleChannel(ch: string) {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch])
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3 min-w-[340px] bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-zinc-200">Edit Assortment</span>
          <button onClick={() => setEditing(false)} className="text-zinc-500 hover:text-zinc-200"><X className="w-4 h-4" /></button>
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Name</label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Description</label>
          <Input value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Start Date</label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">End Date</label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-2">Channels</label>
          <div className="flex flex-wrap gap-1.5">
            {CHANNELS.map(ch => (
              <button
                key={ch}
                onClick={() => toggleChannel(ch)}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                  channels.includes(ch)
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-1">
          <Button onClick={save} disabled={busy || !name.trim()} className="flex-1">
            <Save className="w-3 h-3 mr-1" /> Save
          </Button>
          <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
        <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
      </Button>
      {status !== 'active' && (
        <Button size="sm" onClick={publish} disabled={busy}>
          <Radio className="w-3.5 h-3.5 mr-1" /> Publish
        </Button>
      )}
      {status === 'active' && (
        <Button size="sm" variant="outline" onClick={expire} disabled={busy}>
          <TimerOff className="w-3.5 h-3.5 mr-1" /> Expire
        </Button>
      )}
      <button
        onClick={deleteAssortment}
        disabled={busy}
        className="p-2 rounded-lg hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition-colors"
        title="Delete assortment"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
