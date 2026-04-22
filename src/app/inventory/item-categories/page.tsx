export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Pencil, Tag, ChevronRight } from 'lucide-react'

export default async function ItemCategoriesPage() {
  const categories = await prisma.itemCategory.findMany({
    include: { parent: true, _count: { select: { children: true } } },
    orderBy: [{ indentationLevel: 'asc' }, { code: 'asc' }],
  })

  return (
    <>
      <TopBar title="Item Categories" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2 flex items-center gap-1">
          <Link href="/inventory/item-categories/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <div className="ml-auto text-[12px] text-zinc-500">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</div>
        </div>

        <div className="px-6 py-4">
          <div className="bg-[#16213e] rounded-lg border border-zinc-800/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/40">
              <Tag className="w-4 h-4 text-zinc-500" />
              <span className="text-[13px] font-medium text-zinc-300">Item Categories</span>
            </div>

            {categories.length === 0 ? (
              <div className="py-16 text-center">
                <Tag className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-[13px] text-zinc-500 mb-4">No item categories defined</p>
                <Link href="/inventory/item-categories/new"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors">
                  <Plus className="w-3.5 h-3.5" /> New Category
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/40">
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">Code</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">Description</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">Parent Category</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">Def. Costing Method</th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">Sub-Categories</th>
                    <th className="w-12 pb-2 pt-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2" style={{ paddingLeft: `${cat.indentationLevel * 16}px` }}>
                          <Link href={`/inventory/item-categories/${cat.id}`}
                            className="font-mono text-[13px] text-blue-400 hover:text-blue-300 hover:underline font-semibold">
                            {cat.code}
                          </Link>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[13px] text-zinc-200">{cat.description ?? '—'}</td>
                      <td className="py-3 px-4 text-[13px] text-zinc-400 font-mono">{cat.parent?.code ?? '—'}</td>
                      <td className="py-3 px-4">
                        <span className="text-[12px] text-zinc-400">{cat.defCostingMethod ?? 'FIFO'}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-[13px] tabular-nums text-zinc-400">{cat._count.children}</td>
                      <td className="py-3 px-4">
                        <Link href={`/inventory/item-categories/${cat.id}`}>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
