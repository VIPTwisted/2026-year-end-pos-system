import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReviewActions from './ReviewActions'

export default async function PerformanceReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const review = await prisma.performanceReview.findUnique({
    where: { id },
    include: { goals: true },
  })
  if (!review) notFound()

  const employee = await prisma.employee.findUnique({
    where: { id: review.employeeId },
    select: { firstName: true, lastName: true },
  })
  const reviewer = review.reviewerId
    ? await prisma.employee.findUnique({ where: { id: review.reviewerId }, select: { firstName: true, lastName: true } })
    : null

  const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'success' | 'secondary'> = {
    draft: 'secondary', in_progress: 'default', employee_review: 'warning',
    manager_review: 'warning', completed: 'success',
  }

  function StarDisplay({ rating }: { rating: number | null | undefined }) {
    if (!rating) return <span className="text-zinc-600">Not rated</span>
    return (
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <span key={s} className={s <= rating ? 'text-amber-400 text-lg' : 'text-zinc-700 text-lg'}>★</span>
        ))}
        <span className="ml-1 text-zinc-400 text-sm">({rating}/5)</span>
      </span>
    )
  }

  return (
    <>
      <TopBar title={`Review ${review.reviewNo}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-zinc-100">{review.reviewNo}</h1>
              <Badge variant={STATUS_VARIANT[review.status] ?? 'secondary'}>
                {review.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              {employee ? `${employee.lastName}, ${employee.firstName}` : review.employeeId}
              {reviewer && ` · Reviewer: ${reviewer.lastName}, ${reviewer.firstName}`}
            </p>
          </div>
          <ReviewActions reviewId={id} currentStatus={review.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Period Start', value: review.reviewPeriodStart ? new Date(review.reviewPeriodStart).toLocaleDateString() : '—' },
            { label: 'Period End', value: review.reviewPeriodEnd ? new Date(review.reviewPeriodEnd).toLocaleDateString() : '—' },
            { label: 'Goals', value: review.goals.length },
            { label: 'Overall Rating', value: review.overallRating ? `${review.overallRating}/5` : '—', color: 'text-amber-400' },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-zinc-500 uppercase mb-1">{k.label}</p>
                <p className={`text-lg font-bold ${k.color ?? 'text-zinc-100'}`}>{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Goals table */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Goals &amp; Ratings</h3>
            {review.goals.length === 0 ? (
              <p className="text-zinc-500 text-sm">No goals attached to this review.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3">Goal</th>
                    <th className="text-left pb-3">Rating</th>
                    <th className="text-left pb-3">Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {review.goals.map(g => (
                    <tr key={g.id}>
                      <td className="py-3 pr-4 text-zinc-200">{g.goalTitle}</td>
                      <td className="py-3 pr-4">
                        <StarDisplay rating={g.rating} />
                      </td>
                      <td className="py-3 text-zinc-400 text-xs">{g.comments ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <h3 className="text-sm font-semibold text-zinc-200 mb-2">Employee Comments</h3>
              <p className="text-sm text-zinc-400">{review.employeeComments ?? 'None provided.'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <h3 className="text-sm font-semibold text-zinc-200 mb-2">Manager Comments</h3>
              <p className="text-sm text-zinc-400">{review.managerComments ?? 'None provided.'}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
