import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { RatingActions } from './RatingActions'

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'}`} />
      ))}
    </span>
  )
}

export default async function RatingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const sp = await searchParams
  const filter = sp.filter || 'pending'

  const whereMap: Record<string, Record<string, unknown>> = {
    pending: { isApproved: false },
    approved: { isApproved: true },
    all: {},
  }

  const [ratings, allRatings] = await Promise.all([
    prisma.productRating.findMany({
      where: whereMap[filter] ?? {},
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true } },
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.productRating.findMany({ where: { isApproved: true }, select: { rating: true } }),
  ])

  const avgRating = allRatings.length > 0
    ? (allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length).toFixed(1)
    : '0.0'
  const pendingCount = await prisma.productRating.count({ where: { isApproved: false } })

  return (
    <>
      <TopBar title="Ratings & Reviews" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">E-Commerce</p>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Ratings &amp; Reviews</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{ratings.length} reviews in this view</p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Avg Rating (Approved)', value: avgRating, sub: 'out of 5.0', icon: Star, color: 'text-yellow-400', fill: true },
              { label: 'Total Reviews', value: allRatings.length.toString(), sub: 'approved reviews', icon: Star, color: 'text-emerald-400', fill: false },
              { label: 'Pending Approval', value: pendingCount.toString(), sub: 'awaiting review', icon: Star, color: 'text-amber-400', fill: false },
            ].map(({ label, value, sub, icon: Icon, color, fill }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${color} ${fill ? 'fill-yellow-400' : ''}`} />
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
                </div>
                <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1">
            {['pending', 'approved', 'all'].map(f => (
              <Link
                key={f}
                href={`/ecommerce/ratings?filter=${f}`}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium capitalize transition-colors border ${
                  filter === f
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-700/60 hover:text-zinc-200'
                }`}
              >
                {f === 'pending' ? 'Pending Approval' : f}
              </Link>
            ))}
          </div>

          {/* Reviews table */}
          {ratings.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-600">
              <Star className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-[13px]">No reviews in this view</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Product', 'Customer', 'Rating', 'Title', 'Verified', 'Date', 'Actions'].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                            h === 'Rating' || h === 'Verified' || h === 'Actions' ? 'text-center' : h === 'Date' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {ratings.map(r => (
                      <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 text-[13px] text-zinc-100 font-medium">{r.product.name}</td>
                        <td className="px-4 py-3 text-[13px] text-zinc-400">
                          {r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : 'Anonymous'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StarDisplay rating={r.rating} />
                        </td>
                        <td className="px-4 py-3 text-[13px] text-zinc-300">{r.title || <span className="text-zinc-600">—</span>}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={r.isVerified ? 'success' : 'secondary'} className="text-[11px]">
                            {r.isVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-[11px] text-zinc-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                        <td className="px-4 py-3 text-center">
                          <RatingActions ratingId={r.id} isApproved={r.isApproved} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
