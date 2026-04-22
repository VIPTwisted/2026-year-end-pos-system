'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function NewCodeForm({ endpoint }: { endpoint: string }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!code || !description) { setError('Code and description are required'); return }
    setSaving(true); setError(null)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase(), description }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      setCode(''); setDescription('')
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 items-end">
        <div className="space-y-1.5">
          <Label className="text-xs">Code</Label>
          <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. FC-001" className="font-mono h-8 text-xs" maxLength={20} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">Description</Label>
          <Input value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Fault description" className="h-8 text-xs" />
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button onClick={handleAdd} disabled={saving || !code || !description} size="sm" className="h-7 px-3 text-xs">
        {saving ? 'Adding…' : 'Add Code'}
      </Button>
    </div>
  )
}
