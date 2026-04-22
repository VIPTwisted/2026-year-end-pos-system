'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, ArrowLeft, Save, Search } from 'lucide-react'

type ProductResult = { id: string; sku: string; name: string; salePrice: number }
type LineItem = { productId?: string; categoryId?: string; lineType: 'product' | 'category'; label: string }

const CHANNELS = ['Online Store', 'POS Terminal', 'Mobile App', 'Wholesale', 'Kiosk', 'B2B Portal']

export default function NewAssortmentPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [lines, setLines] = useState<LineItem[]>([])
  const [channels, setChannels] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState<ProductResult[]>([])
  const [searching, setSearching] = useState(false)

  async function searchProducts() {
    if (!searchQ.trim()) return
    setSearching(true)
    const r = await fetch('/api/products?active=true')
    const data: ProductResult[] = await r.json()
    setSearchResults(
      data.filter(p =>
        p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQ.toLowerCase())
      ).slice(0, 10)
    )
    setSearching(false)
  }

  function addProduct(p: ProductResult) {
    if (lines.some(l => l.productId === p.id)) return
    setLines(prev => [...prev, { productId: p.id, lineType: 'product', label: `${p.name} (${p.sku})` }])
    setSearchResults([])
    setSearchQ('')
  }

  function removeLine(idx: number) {
    setLines(prev => prev.filter((_, i) => i !== idx))
  }

  function toggleChannel(ch: string) {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch])
  }

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    const r = await fetch('/api/assortments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        description: description || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        lines: lines.map(l => ({ productId: l.productId, categoryId: l.categoryId, lineType: l.lineType })),
        channels,
      }),
    })
    if (!r.ok) {
      const e = await r.json()
      setError(e.error ?? 'Save failed')
      setSaving(false)
      return
    }
    const data = await r.json()
    router.push(`/assortments/${data.id}`)
  }

  return (
    <>
      <TopBar title="New Assortment" />
      <main className="flex-1 p-6 overflow-auto max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Create Assortment</h2>
            <p className="text-sm text-zinc-500">Define name, products, channels and date range</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-sm">{error}</div>
        )}

        <Card className="mb-5">
          <CardContent className="p-5">
            <div className="text-sm font-semibold text-zinc-200 mb-4">Assortment Details</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-zinc-500 block mb-1">Name *</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Spring 2026 Assortment" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-zinc-500 block mb-1">Description</label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Start Date</label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">End Date</label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-5">
          <CardContent className="p-5">
            <div className="text-sm font-semibold text-zinc-200 mb-4">Products</div>
            <div className="flex gap-2 mb-3">
              <Input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchProducts()}
                placeholder="Search by name or SKU..."
                className="flex-1"
              />
              <Button variant="outline" onClick={searchProducts} disabled={searching}>
                <Search className="w-4 h-4 mr-1" /> Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="border border-zinc-700 rounded-lg mb-4 overflow-hidden">
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addProduct(p)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-800 text-left border-b border-zinc-800 last:border-0 transition-colors"
                  >
                    <div>
                      <div className="text-sm text-zinc-100">{p.name}</div>
                      <div className="text-xs text-zinc-500 font-mono">{p.sku}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 text-sm font-medium">${p.salePrice.toFixed(2)}</span>
                      <Plus className="w-4 h-4 text-blue-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {lines.length === 0 ? (
              <div className="text-sm text-zinc-600 py-6 text-center border border-dashed border-zinc-800 rounded-lg">
                No products added yet. Search and add products above.
              </div>
            ) : (
              <div className="space-y-2">
                {lines.map((l, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 rounded-lg border border-zinc-800">
                    <div className="text-sm text-zinc-200">{l.label}</div>
                    <button onClick={() => removeLine(i)} className="text-zinc-500 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="text-sm font-semibold text-zinc-200 mb-4">Assign Channels</div>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map(ch => (
                <button
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    channels.includes(ch)
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
            {channels.length > 0 && (
              <div className="mt-3 text-xs text-zinc-500">{channels.length} channel{channels.length !== 1 ? 's' : ''} selected</div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Create Assortment'}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </main>
    </>
  )
}
