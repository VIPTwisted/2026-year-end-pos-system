'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, RefreshCw, ChevronRight, Package2 } from 'lucide-react'

interface ItemCharge {
  id: string
  chargeNo: string
  description: string | null
  genProdPostingGroup: string | null
  vatProdPostingGroup: string | null
  createdAt: string
}

export default function ItemChargesPage() {
  const [charges, setCharges] = useState<ItemCharge[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    fetch(`/api/inventory/item-charges?${p}`)
      .then(r => r.json())
      .then(d => setCharges(Array.isArray(d) ? d : []))
      .catch(() => setCharges([]))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Item Charges"
        breadcrumb={[{ label: 'Inventory', href: '/inventory' }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={load} className="h-8 w-8 flex items-center justify-center rounded border border-zinc-700/60 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <Link href="/inventory/item-charges/new"
              className="flex items-center gap-1.5 h-8 px-4 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              <Plus className="w-3.5 h-3.5" />New
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* Search */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Search charge no. or description…"
            className="h-8 px-3 rounded text-[12px] bg-zinc-800/60 border border-zinc-700/60 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 w-64"
          />
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : charges.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-600">
              <Package2 className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm mb-3">No item charges found</p>
              <Link href="/inventory/item-charges/new" className="text-xs text-blue-400 hover:text-blue-300">Create first item charge →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['No.', 'Description', 'Gen. Prod. Posting Group', 'VAT Prod. Posting Group', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {charges.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-800/20 transition-colors group">
                      <td className="px-4 py-3">
                        <Link href={`/inventory/item-charges/${c.id}`} className="font-mono text-xs font-semibold text-blue-400 hover:text-blue-300">
                          {c.chargeNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-200">{c.description || '—'}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-400">{c.genProdPostingGroup || '—'}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-400">{c.vatProdPostingGroup || '—'}</td>
                      <td className="px-4 py-3">
                        <Link href={`/inventory/item-charges/${c.id}`}>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-4 py-2.5 border-t border-zinc-800/40 text-[11px] text-zinc-600">{charges.length} record{charges.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  )
}
