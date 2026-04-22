export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import {
  Plus, FileText, Trash2, BookOpen, Settings2, Calculator, Filter, ChevronUp, ChevronDown,
} from 'lucide-react'

export default async function ItemsListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; blocked?: string; search?: string; sort?: string; dir?: string }>
}) {
  const sp = await searchParams
  const sort = sp.sort ?? 'sku'
  const dir = sp.dir === 'desc' ? 'desc' : 'asc'

  const orderBy: Record<string, unknown> =
    sort === 'price' ? { salePrice: dir }
    : sort === 'name' ? { name: dir }
    : sort === 'category' ? { category: { name: dir } }
    : { sku: dir }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(sp.category ? { categoryId: sp.category } : {}),
        ...(sp.blocked === 'yes' ? { isActive: false } : sp.blocked === 'no' ? { isActive: true } : {}),
        ...(sp.search ? { OR: [{ name: { contains: sp.search } }, { sku: { contains: sp.search } }] } : {}),
      },
      include: {
        category: true,
        inventory: { select: { quantity: true } },
      },
      orderBy,
    }),
    prisma.productCategory.findMany({ orderBy: { name: 'asc' } }),
  ])

  function SortLink({ col, label }: { col: string; label: string }) {
    const isActive = sort === col
    const nextDir = isActive && dir === 'asc' ? 'desc' : 'asc'
    const params = new URLSearchParams({ ...(sp as Record<string, string>), sort: col, dir: nextDir })
    return (
      <a href={`/products?${params}`} className="flex items-center gap-1 group">
        {label}
        {isActive
          ? dir === 'asc'
            ? <ChevronUp className="w-3 h-3 text-blue-400" />
            : <ChevronDown className="w-3 h-3 text-blue-400" />
          : <ChevronUp className="w-3 h-3 text-zinc-700 group-hover:text-zinc-500" />}
      </a>
    )
  }

  return (
    <>
      <TopBar title="Items" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2 flex items-center gap-1 flex-wrap">
          <Link href="/products/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
          <div className="w-px h-4 bg-zinc-700 mx-1" />
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
            <FileText className="w-3.5 h-3.5" /> Edit
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <div className="w-px h-4 bg-zinc-700 mx-1" />
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
            <BookOpen className="w-3.5 h-3.5" /> Item Journal
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
            <Settings2 className="w-3.5 h-3.5" /> Adjust Inventory
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
            <Calculator className="w-3.5 h-3.5" /> Calculate Inventory
          </button>
          <div className="ml-auto text-[12px] text-zinc-500">{products.length} item{products.length !== 1 ? 's' : ''}</div>
        </div>

        <div className="flex h-[calc(100dvh-9rem)]">

          {/* Filter Pane */}
          <div className="w-56 border-r border-zinc-800/50 bg-[#0f0f1a] p-4 space-y-5 overflow-auto shrink-0">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                <Filter className="w-3 h-3" /> Filters
              </div>

              <form method="GET">
                <div className="space-y-4">
                  {/* Search */}
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Search</label>
                    <input
                      name="search"
                      defaultValue={sp.search ?? ''}
                      placeholder="No., Description…"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Item Category Code</label>
                    <select
                      name="category"
                      defaultValue={sp.category ?? ''}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-zinc-600"
                    >
                      <option value="">All</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Blocked */}
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Blocked</label>
                    <select
                      name="blocked"
                      defaultValue={sp.blocked ?? ''}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-zinc-600"
                    >
                      <option value="">All</option>
                      <option value="no">No (Active)</option>
                      <option value="yes">Yes (Blocked)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium py-1.5 rounded transition-colors"
                  >
                    Apply
                  </button>
                  <a
                    href="/products"
                    className="block text-center text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Clear filters
                  </a>
                </div>
              </form>
            </div>
          </div>

          {/* Main Table */}
          <div className="flex-1 overflow-auto">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                <p className="text-[13px] mb-2">No items found</p>
                <Link href="/products/new" className="text-[12px] text-blue-400 hover:text-blue-300">
                  + Create new item
                </Link>
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10">
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap">
                      <SortLink col="sku" label="No." />
                    </th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                      <SortLink col="name" label="Description" />
                    </th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap">
                      Base Unit of Measure
                    </th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap">
                      <SortLink col="category" label="Item Category Code" />
                    </th>
                    <th className="text-right px-4 py-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap">
                      <SortLink col="price" label="Unit Price" />
                    </th>
                    <th className="text-right px-4 py-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap">
                      Inventory
                    </th>
                    <th className="text-center px-4 py-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap">
                      Blocked
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {products.map(p => {
                    const totalQty = p.inventory.reduce((s, i) => s + i.quantity, 0)
                    return (
                      <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-4 py-2.5">
                          <Link href={`/products/${p.id}`} className="font-mono text-blue-400 hover:text-blue-300 hover:underline">
                            {p.sku}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-zinc-200 max-w-xs truncate">
                          <Link href={`/products/${p.id}`} className="hover:text-blue-300 transition-colors">
                            {p.name}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400 uppercase text-[12px]">{p.unit}</td>
                        <td className="px-4 py-2.5 text-zinc-400 text-[12px]">
                          {p.category?.name ?? <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-emerald-400 font-medium">
                          {formatCurrency(p.salePrice)}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">
                          {totalQty.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {!p.isActive ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400">Yes</span>
                          ) : (
                            <span className="text-zinc-700 text-[12px]">No</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
