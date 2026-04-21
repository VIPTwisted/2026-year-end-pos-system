'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Store = {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  phone: string | null
  email: string | null
  taxRate: number
  currency: string
  isActive: boolean
}

export function StoreEditForm({ store }: { store: Store }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: store.name,
    address: store.address ?? '',
    city: store.city ?? '',
    state: store.state ?? '',
    zip: store.zip ?? '',
    phone: store.phone ?? '',
    email: store.email ?? '',
    taxRate: String(store.taxRate),
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      zip: form.zip.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      taxRate: parseFloat(form.taxRate),
    }

    try {
      const res = await fetch(`/api/stores/${store.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? 'Update failed')
      }

      setEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive() {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/stores/${store.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !store.isActive }),
      })

      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? 'Update failed')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'w-full rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm px-3 py-2 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500'
  const labelCls = 'block text-xs text-zinc-500 uppercase tracking-wide mb-1'

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wide">
            Store Settings
          </h3>
          <div className="flex items-center gap-2">
            {!editing && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
            <Button
              size="sm"
              variant={store.isActive ? 'destructive' : 'outline'}
              disabled={saving}
              onClick={handleToggleActive}
            >
              {store.isActive ? 'Deactivate' : 'Reactivate'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-900/30 border border-red-700 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {editing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="se-name" className={labelCls}>Store Name</label>
              <input
                id="se-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="se-address" className={labelCls}>Address</label>
              <input
                id="se-address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                className={inputCls}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="se-city" className={labelCls}>City</label>
                <input
                  id="se-city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="se-state" className={labelCls}>State</label>
                <input
                  id="se-state"
                  name="state"
                  type="text"
                  value={form.state}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="TX"
                />
              </div>
              <div>
                <label htmlFor="se-zip" className={labelCls}>ZIP</label>
                <input
                  id="se-zip"
                  name="zip"
                  type="text"
                  value={form.zip}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="se-phone" className={labelCls}>Phone</label>
                <input
                  id="se-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="se-email" className={labelCls}>Email</label>
                <input
                  id="se-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label htmlFor="se-taxRate" className={labelCls}>Tax Rate (decimal, e.g. 0.0825)</label>
              <input
                id="se-taxRate"
                name="taxRate"
                type="number"
                step="0.0001"
                min="0"
                max="1"
                value={form.taxRate}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false)
                  setError(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Address</p>
              <p className="text-zinc-300">
                {store.address
                  ? `${store.address}, ${store.city ?? ''} ${store.state ?? ''} ${store.zip ?? ''}`.trim()
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Phone</p>
              <p className="text-zinc-300">{store.phone ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Email</p>
              <p className="text-zinc-300 break-all">{store.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Tax Rate</p>
              <p className="text-zinc-300">{(store.taxRate * 100).toFixed(4)}%</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Currency</p>
              <p className="text-zinc-300">{store.currency}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Status</p>
              <Badge variant={store.isActive ? 'success' : 'destructive'}>
                {store.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
