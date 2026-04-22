'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Tag } from 'lucide-react'

interface PriceLine {
  id: string
  productType: string
  productNo: string | null
  description: string | null
  unitOfMeasure: string
  minQty: number
  unitPrice: number
  allowLineDisc: number
}

interface PriceList {
  id: string
  code: string
  description: string | null
  assignToType: string
  assignTo: string | null
  currency: string
  startingDate: string | null
  endingDate: string | null
  status: string
  createdAt: string
  lines: PriceLine[]
}

const STATUS_CLS: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Draft: 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30',
  Inactive: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function SalesPriceListDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<PriceList | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2600)
  }

  useEffect(() => {
    fetch(`/api/sales/price-lists/${id}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => notify('Failed to load', 'err'))
      .finally(() => setLoading(false))
  }, [id])

  const activate = async () => {
    const res = await fetch(`/api/sales/price-lists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: data?.status === 'Active' ? 'Draft' : 'Active' }),
    })
    if (res.ok) {
      const updated = await res.json()
      setData(d => d ? { ...d, status: updated.status } : d)
      notify(updated.status === 'Active' ? 'Activated' : 'Moved to Draft')
    } else {
      notify('Update failed', 'err')
    }
  }

  if (loading) return (
    <>
      <TopBar title="Price List" breadcrumb={[{ label: 'Sales', href: '/sales' }, { label: 'Price Lists', href: '/sales/price-lists' }]} />
      <main className="flex-1 bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
      </main>
    </>
  )

  if (!data) return (
    <>
      <TopBar title="Not Found" breadcrumb={[{ label: 'Price Lists', href: '/sales/price-lists' }]} />
      <main className="flex-1 bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <Tag className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm mb-4">Not found</p>
          <Link href="/sales/price-lists" className="text-xs text-blue-400 hover:text-blue-300">Back to list</Link>
        </div>
      </main>
    </>
  )

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title={data.code}
        breadcrumb={[{ label: 'Sales', href: '/sales' }, { label: 'Price Lists', href: '/sales/price-lists' }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={activate}
              className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
              {data.status === 'Active' ? 'Deactivate' : 'Activate'}
            </button>
            <Link href="/sales/price-lists" className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Back</Link>
          </div>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-5">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">General</h2>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_CLS[data.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{data.status}</span>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-5">
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Code</p><p className="text-sm font-mono font-semibold text-zinc-100">{data.code}</p></div>
            <div className="md:col-span-2"><p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Description</p><p className="text-sm text-zinc-200">{data.description || '—'}</p></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Currency</p><p className="text-sm font-mono text-zinc-100">{data.currency}</p></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Assign-to Type</p><p className="text-sm text-zinc-300">{data.assignToType}</p></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Assign-to</p><p className="text-sm font-mono text-zinc-300">{data.assignTo || '—'}</p></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Starting Date</p><p className="text-sm text-zinc-300">{fmtDate(data.startingDate)}</p></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Ending Date</p><p className="text-sm text-zinc-300">{fmtDate(data.endingDate)}</p></div>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Lines</h2>
            <span className="text-xs text-zinc-500">{data.lines?.length ?? 0} lines</span>
          </div>
          {!data.lines?.length ? (
            <div className="py-10 text-center text-zinc-600 text-sm">No lines.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['Product Type', 'Product No.', 'Description', 'Unit of Measure', 'Min. Qty', 'Unit Price', 'Allow Disc%'].map(h => (
                      <th key={h} className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap ${h.includes('Qty') || h.includes('Price') ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {data.lines.map(l => (
                    <tr key={l.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-zinc-400">{l.productType}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-blue-400">{l.productNo || '—'}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-200">{l.description || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400">{l.unitOfMeasure}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-zinc-300 tabular-nums">{l.minQty}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold text-emerald-400 tabular-nums">{fmt(l.unitPrice)}</td>
                      <td className="px-4 py-2.5 text-center text-xs">{l.allowLineDisc ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
