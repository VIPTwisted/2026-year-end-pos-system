'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Loader2 } from 'lucide-react'

const CENTER_TYPES = ['department', 'project', 'region', 'product_line'] as const

export default function NewCostCenterPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'department',
    description: '',
    isActive: true,
  })

  function handleChange(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim()) {
      setError('Code and Name are required.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/finance/cost-accounting/centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          type: form.type,
          description: form.description.trim() || undefined,
          isActive: form.isActive,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to create cost center.')
        setSaving(false)
        return
      }

      router.push('/finance/cost-accounting')
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Cost Center" />
      <main className="flex-1 p-6 overflow-auto space-y-6 max-w-2xl">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">New Cost Center</h2>
          <p className="text-sm text-zinc-500">Create a cost center to track costs by department, project, or region</p>
        </div>

        <Card>
          <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
            <h3 className="text-sm font-semibold text-zinc-200">Cost Center Details</h3>
          </div>
          <CardContent className="pt-5 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Code *</label>
                <Input
                  value={form.code}
                  onChange={e => handleChange('code', e.target.value)}
                  placeholder="OPERATIONS"
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Type *</label>
                <select
                  value={form.type}
                  onChange={e => handleChange('type', e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {CENTER_TYPES.map(t => (
                    <option key={t} value={t} className="bg-zinc-900 capitalize">
                      {t.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Name *</label>
              <Input
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Operations Department"
                className="bg-zinc-900 border-zinc-700 text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Description</label>
              <Input
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Manages day-to-day store operations"
                className="bg-zinc-900 border-zinc-700 text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={e => handleChange('isActive', e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="isActive" className="text-sm text-zinc-300 cursor-pointer">
                Active (visible in reports and entry forms)
              </label>
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Saving…</>
            ) : (
              <><Save className="w-4 h-4 mr-1" />Create Cost Center</>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/finance/cost-accounting')}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </main>
    </>
  )
}
