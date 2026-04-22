'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PackageOpen } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type Line = {
  id: string
  productName: string
  sku: string
  quantity: number
  qtyReceived: number
  unitCost: number
}

export function BlanketPOReleaseForm({ orderId, lines }: { orderId: string; lines: Line[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [releaseDate, setReleaseDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openLines = lines.filter(l => l.quantity - l.qtyReceived > 0)

  const handleRelease = async () => {
    if (selected.size === 0) { setError('Select at least one line'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/purchasing/blanket/${orderId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineIds: Array.from(selected), releaseDate: releaseDate || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Release failed')
      router.push(`/purchasing/${data.po.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
      setLoading(false)
    }
  }

  if (openLines.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="py-6 text-center text-zinc-500 text-sm">All lines fully received</CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-sm text-zinc-100 flex items-center gap-2">
          <PackageOpen className="w-4 h-4" />Release Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          {openLines.map(line => {
            const remaining = line.quantity - line.qtyReceived
            const isSelected = selected.has(line.id)
            return (
              <label key={line.id} className={`flex items-start gap-2 p-2 rounded-md cursor-pointer border transition-colors ${isSelected ? 'border-blue-600 bg-blue-900/10' : 'border-zinc-700 hover:border-zinc-600'}`}>
                <input type="checkbox" checked={isSelected} onChange={() => toggle(line.id)} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-100 truncate">{line.productName}</p>
                  <p className="text-xs text-zinc-500">{line.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-blue-400 font-mono">{remaining} remaining</p>
                  <p className="text-xs text-zinc-500">{formatCurrency(remaining * line.unitCost)}</p>
                </div>
              </label>
            )
          })}
        </div>
        <div>
          <label className="text-xs text-zinc-400 block mb-1">Release Date</label>
          <input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button onClick={handleRelease} disabled={loading || selected.size === 0} size="sm" className="w-full">
          {loading ? 'Creating PO...' : `Release ${selected.size} line(s) → PO`}
        </Button>
      </CardContent>
    </Card>
  )
}
