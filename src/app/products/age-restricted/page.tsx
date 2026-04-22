import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AgeRestrictedPage() {
  const products = await prisma.product.findMany({
    where: { minAge: { gt: 0 } },
    include: { category: { select: { name: true } } },
    orderBy: { name: 'asc' },
  })

  const allCount = await prisma.product.count()
  const restrictedCount = await prisma.product.count({ where: { minAge: { gt: 0 } } })

  return (
    <>
      <TopBar title="Age-Restricted Products" />
      <main className="flex-1 p-6 overflow-auto min-h-[100dvh] bg-[#0f0f1a]">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">TOTAL PRODUCTS</div>
              <div className="text-2xl font-bold text-zinc-100">{allCount}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">AGE RESTRICTED</div>
              <div className="text-2xl font-bold text-amber-400">{restrictedCount}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">UNRESTRICTED</div>
              <div className="text-2xl font-bold text-emerald-400">{allCount - restrictedCount}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-100">
              Age-Restricted Products ({restrictedCount})
            </h2>
            <Link href="/products" className="text-xs text-blue-400 hover:text-blue-300">
              ← All Products
            </Link>
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#16213e]">
                  {['Product', 'SKU', 'Category', 'Min Age', 'Price', 'Edit'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                      No age-restricted products. Edit products to add age requirements.
                    </td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} className="border-b border-zinc-800 hover:bg-zinc-800/20">
                      <td className="px-4 py-3 text-zinc-200 font-medium">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{p.sku}</td>
                      <td className="px-4 py-3 text-zinc-400">{p.category?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400">
                          {p.minAge}+
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-300">${p.salePrice.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/products/${p.id}`}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-zinc-600">
            To mark a product as age-restricted, edit the product and set the Minimum Age field.
            The POS will automatically show an age verification prompt when these items are added to cart.
          </p>
        </div>
      </main>
    </>
  )
}
