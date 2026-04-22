'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'

type Program = {
  id: string
  name: string
  description: string | null
  status: string
  startDate: Date | null
  endDate: Date | null
}

export function ProgramSettingsForm({ program }: { program: Program }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: program.name,
    description: program.description ?? '',
    status: program.status,
    startDate: program.startDate ? new Date(program.startDate).toISOString().slice(0, 10) : '',
    endDate: program.endDate ? new Date(program.endDate).toISOString().slice(0, 10) : '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function set(k: string, v: unknown) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)
    const payload = {
      name: form.name,
      description: form.description || null,
      status: form.status,
      startDate: form.startDate ? new Date(`${form.startDate}T00:00:00.000Z`).toISOString() : null,
      endDate: form.endDate ? new Date(`${form.endDate}T23:59:59.999Z`).toISOString() : null,
    }
    const res = await fetch(`/api/loyalty/programs/${program.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) { setSaved(true); router.refresh() }
    else { const d = await res.json(); setError(d.error ?? 'Failed to save') }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-zinc-300 mb-1 block">Program Name</Label>
          <Input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
            required
          />
        </div>
        <div>
          <Label className="text-zinc-300 mb-1 block">Status</Label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <Label className="text-zinc-300 mb-1 block">Description</Label>
        <Input
          value={form.description}
          onChange={e => set('description', e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-zinc-100"
        />
      </div>

      <div className="border border-zinc-800 rounded-lg p-4 space-y-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Date Range (optional)</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-zinc-300 mb-1 block">Start Date</Label>
            <Input
              type="date"
              value={form.startDate}
              onChange={e => set('startDate', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>
          <div>
            <Label className="text-zinc-300 mb-1 block">End Date</Label>
            <Input
              type="date"
              value={form.endDate}
              onChange={e => set('endDate', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>
        </div>
        <p className="text-xs text-zinc-600">Leave blank for an indefinite program. Earning rates and reward rates are set per tier.</p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {saved && <p className="text-emerald-400 text-sm">Settings saved successfully.</p>}

      <Button type="submit" disabled={loading} className="w-full md:w-auto">
        <Save className="w-4 h-4 mr-2" />
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  )
}
