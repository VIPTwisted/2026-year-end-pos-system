export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Tag, Pencil } from 'lucide-react'

function FastTab({ title, open = true, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
      <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 list-none flex items-center justify-between select-none">
        <span>{title}</span>
        <span className="text-zinc-600 text-[10px]">▼</span>
      </summary>
      <div className="px-4 pb-4 pt-3 border-t border-zinc-800/40">
        {children}
      </div>
    </details>
  )
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-[13px] text-zinc-100 ${mono ? 'font-mono' : ''}`}>
        {value ?? <span className="text-zinc-600">—</span>}
      </p>
    </div>
  )
}

export default async function ItemCategoryCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const category = await prisma.itemCategory.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, code: true, description: true } },
      children: {
        orderBy: { code: 'asc' },
        select: { id: true, code: true, description: true, isActive: true },
      },
    },
  })

  if (!category) notFound()

  // Count products using this category code — via ProductCategory code match (best-effort)
  const matchingProductCategory = await prisma.productCategory.findFirst({
    where: { name: { equals: category.code, mode: 'insensitive' } },
    include: { _count: { select: { products: true } } },
  }).catch(() => null)

  const itemCount = matchingProductCategory?._count?.products ?? 0

  return (
    <>
      <TopBar title={category.code} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* D365 Header Band */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/inventory/item-categories"
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Item Categories
              </Link>
              <span className="text-zinc-700">›</span>
              <Tag className="w-4 h-4 text-zinc-400" />
              <span className="font-bold text-base text-zinc-100 font-mono">{category.code}</span>
              {category.description && (
                <span className="text-zinc-400 text-sm">{category.description}</span>
              )}
              {!category.isActive && (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400">Inactive</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="h-7 px-3 text-[12px] font-medium text-zinc-300 border border-zinc-700 hover:border-zinc-500 rounded transition-colors inline-flex items-center gap-1.5">
                <Pencil className="w-3 h-3" /> Edit
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 max-w-3xl space-y-3">

          {/* General FastTab */}
          <FastTab title="General">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Code" value={category.code} mono />
              <Field label="Description" value={category.description} />
              <Field label="Parent Category Code" value={
                category.parent
                  ? <Link href={`/inventory/item-categories/${category.parent.id}`}
                      className="text-blue-400 hover:text-blue-300 hover:underline font-mono">
                      {category.parent.code}
                    </Link>
                  : null
              } />
              <Field label="Def. Costing Method" value={category.defCostingMethod ?? 'FIFO'} />
              <Field label="Indentation Level" value={category.indentationLevel.toString()} />
              <Field label="No. of Items" value={itemCount.toString()} />
              <Field label="No. of Sub-Categories" value={category.children.length.toString()} />
              <Field label="Created" value={new Date(category.createdAt).toLocaleDateString()} />
            </div>
          </FastTab>

          {/* Sub-Categories FastTab */}
          <FastTab title={`Sub-Categories (${category.children.length})`} open={category.children.length > 0}>
            {category.children.length === 0 ? (
              <p className="text-[13px] text-zinc-500 py-2">No sub-categories defined.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/40">
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 font-medium">Code</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 font-medium">Description</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {category.children.map(child => (
                    <tr key={child.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-2.5">
                        <Link href={`/inventory/item-categories/${child.id}`}
                          className="text-blue-400 hover:text-blue-300 hover:underline font-mono text-[13px] font-semibold">
                          {child.code}
                        </Link>
                      </td>
                      <td className="py-2.5 text-[13px] text-zinc-300 pr-4">{child.description ?? '—'}</td>
                      <td className="py-2.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded ${child.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                          {child.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </FastTab>

        </div>
      </main>
    </>
  )
}
