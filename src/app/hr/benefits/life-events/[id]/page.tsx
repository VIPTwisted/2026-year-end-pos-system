import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function LifeEventDetailPage({ params }: { params: { id: string } }) {
  const ev = await prisma.lifeEvent.findUnique({
    where: { id: params.id },
    include: { employee: true },
  })
  if (!ev) notFound()

  const allowedChanges = [
    'Health Insurance', 'Dental / Vision', 'Flexible Spending Account (FSA)',
    'Dependent Care FSA', 'Life Insurance', 'Supplemental Insurance',
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <TopBar title="Life Event Detail" />
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* Event info */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-zinc-100 text-lg">
                {ev.employee.firstName} {ev.employee.lastName}
              </h2>
              <p className="text-sm text-zinc-400 capitalize mt-0.5">{ev.eventType.replace(/_/g, ' ')}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              ev.status === 'approved' ? 'bg-green-500/20 text-green-400' :
              ev.status === 'processed' ? 'bg-blue-500/20 text-blue-400' :
              ev.status === 'expired' ? 'bg-red-500/20 text-red-400' :
              ev.status === 'in_review' ? 'bg-purple-500/20 text-purple-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>{ev.status.replace(/_/g, ' ')}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-zinc-500 text-xs">Event Date</p>
              <p className="text-zinc-200">{new Date(ev.eventDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Submitted</p>
              <p className="text-zinc-200">{new Date(ev.createdAt).toLocaleDateString()}</p>
            </div>
            {ev.processedAt && (
              <div>
                <p className="text-zinc-500 text-xs">Processed</p>
                <p className="text-zinc-200">{new Date(ev.processedAt).toLocaleDateString()}</p>
              </div>
            )}
            {ev.documentation && (
              <div className="col-span-2">
                <p className="text-zinc-500 text-xs">Documentation</p>
                <p className="text-zinc-200 break-all">{ev.documentation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Benefit changes allowed */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-200 mb-3">Benefit Elections Allowed</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {allowedChanges.map(benefit => (
              <div key={benefit} className="flex items-center gap-2 text-sm text-zinc-300">
                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {ev.status === 'pending' || ev.status === 'in_review' ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-200 mb-3">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <form action={`/api/hr/benefits/life-events/${ev.id}`} method="PATCH">
                <button formAction={`/api/hr/benefits/life-events/${ev.id}?action=approve`}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Approve
                </button>
              </form>
              <Link href={`/api/hr/benefits/life-events/${ev.id}?action=process`}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Mark Processed
              </Link>
              <Link href={`/api/hr/benefits/life-events/${ev.id}?action=expire`}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Expire
              </Link>
            </div>
          </div>
        ) : null}

        <div className="flex gap-3">
          <Link href="/hr/benefits/life-events"
            className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm transition-colors">
            Back to Life Events
          </Link>
        </div>
      </div>
    </div>
  )
}
