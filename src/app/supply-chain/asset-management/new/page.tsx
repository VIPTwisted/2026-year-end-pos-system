'use client'
// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Wrench } from 'lucide-react'

export default function NewAssetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    type: 'machine',
    serialNumber: '',
    location: '',
    purchaseDate: '',
    warrantyExpiry: '',
    cost: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Asset name is required'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/supply-chain/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          serialNumber: form.serialNumber || null,
          location: form.location || null,
          purchaseDate: form.purchaseDate || null,
          warrantyExpiry: form.warrantyExpiry || null,
          cost: form.cost ? parseFloat(form.cost) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/supply-chain/asset-management')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <TopBar title="New Asset" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/supply-chain/asset-management"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Assets
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-zinc-400" />
                  Asset Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Asset Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="e.g. Forklift #2"
                      className={inputCls}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Type <span className="text-red-400">*</span></label>
                    <select value={form.type} onChange={set('type')} className={inputCls}>
                      <option value="machine">Machine</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="facility">Facility</option>
                      <option value="tool">Tool</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Serial Number</label>
                    <input
                      type="text"
                      value={form.serialNumber}
                      onChange={set('serialNumber')}
                      placeholder="SN-XXXXXXXXX"
                      className={inputCls}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className={labelCls}>Location</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={set('location')}
                      placeholder="e.g. Warehouse A, Bay 3"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Purchase Date</label>
                    <input type="date" value={form.purchaseDate} onChange={set('purchaseDate')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Warranty Expiry</label>
                    <input type="date" value={form.warrantyExpiry} onChange={set('warrantyExpiry')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Cost (USD)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.cost}
                      onChange={set('cost')}
                      placeholder="0.00"
                      className={inputCls}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link href="/supply-chain/asset-management">
                <Button type="button" variant="outline" size="sm">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Creating…' : 'Create Asset'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
