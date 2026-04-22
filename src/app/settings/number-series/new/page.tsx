'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewNumberSeriesPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')
  const [startingNo, setStartingNo] = useState('1')
  const [incrementBy, setIncrementBy] = useState('1')
  const [endingNo, setEndingNo] = useState('')
  const [paddingLength, setPaddingLength] = useState('6')
  const [isDefault, setIsDefault] = useState(true)
  const [allowManual, setAllowManual] = useState(true)

  // Live preview
  const nextNo = Math.max(parseInt(startingNo) || 1, 1)
  const padded = String(nextNo).padStart(parseInt(paddingLength) || 6, '0')
  const preview = [prefix, padded, suffix].filter(Boolean).join('')

  async function handleSave() {
    if (!code || !description) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/number-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          description,
          prefix: prefix || null,
          suffix: suffix || null,
          startingNo: parseInt(startingNo) || 1,
          incrementBy: parseInt(incrementBy) || 1,
          endingNo: endingNo ? parseInt(endingNo) : null,
          paddingLength: parseInt(paddingLength) || 6,
          isDefault,
          allowManual,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to create series')
        return
      }
      router.push('/settings/number-series')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Number Series" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 max-w-2xl space-y-5">

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800/40">
            <h2 className="text-[14px] font-semibold text-zinc-100">New Number Series</h2>
          </div>
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Series Code *</Label>
                <Input
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ORD, CASE, INV"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description *</Label>
                <Input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Sales Order Numbers"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Prefix</Label>
                <Input value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="e.g. ORD-" />
              </div>
              <div className="space-y-1.5">
                <Label>Suffix</Label>
                <Input value={suffix} onChange={e => setSuffix(e.target.value)} placeholder="e.g. -2026" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Starting No.</Label>
                <Input type="number" value={startingNo} onChange={e => setStartingNo(e.target.value)} min={1} />
              </div>
              <div className="space-y-1.5">
                <Label>Increment By</Label>
                <Input type="number" value={incrementBy} onChange={e => setIncrementBy(e.target.value)} min={1} />
              </div>
              <div className="space-y-1.5">
                <Label>Ending No. (optional)</Label>
                <Input type="number" value={endingNo} onChange={e => setEndingNo(e.target.value)} placeholder="No limit" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Padding Length</Label>
              <Input type="number" value={paddingLength} onChange={e => setPaddingLength(e.target.value)} min={1} max={12} className="w-32" />
              <p className="text-xs text-zinc-500">Pads the numeric part with leading zeros to this width</p>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm text-zinc-300">Default series for this code</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={allowManual} onChange={e => setAllowManual(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm text-zinc-300">Allow manual number entry</span>
              </label>
            </div>

            {/* Live preview */}
            <div className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3">
              <p className="text-xs text-zinc-500 mb-1">First number preview</p>
              <p className="font-mono text-lg text-blue-400">{preview || <span className="text-zinc-700">—</span>}</p>
            </div>

            {error && <p className="text-[12px] text-red-400">{error}</p>}

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" size="sm" onClick={() => router.push('/settings/number-series')}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !code || !description} className="bg-blue-600 hover:bg-blue-500">
                {saving ? 'Creating…' : 'Create Series'}
              </Button>
            </div>
          </div>
        </div>

        </div>
      </main>
    </>
  )
}
