export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft, BookOpen, Tag, Package, Globe, FileText, Archive } from 'lucide-react'
import { notFound } from 'next/navigation'

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  archived: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  inactive: 'bg-zinc-700/50 text-zinc-500 border-zinc-700',
}

export default async function CatalogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const catalog = await prisma.ecomCatalog.findUnique({
    where: { id },
    include: {
      categories: { orderBy: { position: 'asc' } },
      products: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  })

  if (!catalog) notFound()

  const featuredCount = catalog.products.filter(p => p.isFeatured).length
  const activeProducts = catalog.products.filter(p => p.status === 'active').length

  return (
    <main className="flex-1 p-6 bg-[#0f0f1a] overflow-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/catalog" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-xs">
          <ChevronLeft className="w-3 h-3" /> Catalogs
        </Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-zinc-500" /> {catalog.name}
        </h1>
        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[catalog.status] ?? STATUS_STYLES.draft}`}>
          {catalog.status}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: catalog.products.length, icon: Package, color: 'text-zinc-100' },
          { label: 'Active Products', value: activeProducts, icon: Globe, color: 'text-emerald-400' },
          { label: 'Featured', value: featuredCount, icon: Tag, color: 'text-amber-400' },
          { label: 'Categories', value: catalog.categories.length, icon: BookOpen, color: 'text-blue-400' },
        ].map(kpi => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-500">{kpi.label}</span>
              </div>
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            </div>
          )
        })}
      </div>

      {/* Catalog metadata */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Catalog Details</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
          {[
            { label: 'Status', value: catalog.status },
            { label: 'Channel', value: catalog.channelName ?? '—' },
            { label: 'Published At', value: catalog.publishedAt ? new Date(catalog.publishedAt).toLocaleDateString() : '—' },
            { label: 'Created', value: new Date(catalog.createdAt).toLocaleDateString() },
          ].map(item => (
            <div key={item.label}>
              <div className="text-xs text-zinc-500 mb-1">{item.label}</div>
              <div className="text-xs text-zinc-200">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Categories ({catalog.categories.length})</p>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Name</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Slug</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Products</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Position</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {catalog.categories.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-600">No categories</td></tr>
              ) : catalog.categories.map(cat => (
                <tr key={cat.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 text-zinc-200 font-medium">{cat.name}</td>
                  <td className="px-4 py-2.5 text-zinc-500 font-mono">{cat.slug}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{cat.productCount}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{cat.position}</td>
                  <td className="px-4 py-2.5">
                    <span className={cat.isActive ? 'text-emerald-400' : 'text-zinc-600'}>{cat.isActive ? 'Yes' : 'No'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Products */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Products ({catalog.products.length})</p>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Name</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">SKU</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Category</th>
                <th className="text-right px-4 py-2 font-medium uppercase tracking-widest">Price</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Status</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {catalog.products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-600">No products in this catalog</td></tr>
              ) : catalog.products.map(p => (
                <tr key={p.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 text-zinc-200 font-medium max-w-[200px] truncate">{p.name}</td>
                  <td className="px-4 py-2.5 text-zinc-500 font-mono">{p.sku ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{p.categoryName ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-300">
                    {p.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    {p.salePrice && (
                      <span className="ml-1 text-red-400">
                        {p.salePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-xs border ${STATUS_STYLES[p.status] ?? STATUS_STYLES.draft}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={p.isFeatured ? 'text-amber-400' : 'text-zinc-600'}>{p.isFeatured ? 'Yes' : 'No'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
