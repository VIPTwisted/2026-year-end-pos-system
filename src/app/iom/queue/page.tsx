import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Layers, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import QueueRetry from './QueueRetry'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-zinc-700 text-zinc-300',
  processing: 'bg-blue-900/50 text-blue-300',
  completed: 'bg-emerald-900/50 text-emerald-300',
  failed: 'bg-red-900/50 text-red-300',
  max_retries: 'bg-orange-900/50 text-orange-300',
}

const STATUSES = ['pending', 'processing', 'failed', 'max_retries']

export default async function QueuePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams
  const status = sp.status

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [queue, pendingCount, processingCount, completedToday, failedCount] = await Promise.all([
    prisma.orderQueue.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.orderQueue.count({ where: { status: 'pending' } }),
    prisma.orderQueue.count({ where: { status: 'processing' } }),
    prisma.orderQueue.count({ where: { status: 'completed', processedAt: { gte: startOfDay } } }),
    prisma.orderQueue.count({ where: { status: { in: ['failed', 'max_retries'] } } }),
  ])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
        <Layers className="w-5 h-5 text-indigo-400" /> Order Ingestion Queue
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: pendingCount, color: 'text-zinc-300' },
          { label: 'Processing', value: processingCount, color: 'text-blue-400' },
          { label: 'Completed Today', value: completedToday, color: 'text-emerald-400' },
          { label: 'Failed', value: failedCount, color: failedCount > 0 ? 'text-red-400' : 'text-zinc-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">{label}</div>
            <div className={cn('text-2xl font-bold', color)}>{value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/iom/queue" className={cn('px-3 py-1.5 rounded-lg text-sm transition-colors', !status ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700')}>
          All
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/iom/queue?status=${s}`}
            className={cn('px-3 py-1.5 rounded-lg text-sm capitalize transition-colors', status === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700')}>
            {s.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800">
            <tr>
              <th className="text-left p-4 text-zinc-500 font-medium">Message ID</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Source</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Status</th>
              <th className="text-center p-4 text-zinc-500 font-medium">Retries</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Error</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Created</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((item) => (
              <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="p-4 font-mono text-xs text-zinc-400">{item.messageId.slice(0, 16)}...</td>
                <td className="p-4 text-xs text-zinc-300">{item.sourceType}</td>
                <td className="p-4">
                  <span className={cn('px-2 py-0.5 rounded text-xs capitalize', STATUS_COLORS[item.status] ?? 'bg-zinc-700 text-zinc-400')}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-4 text-center text-xs text-zinc-400">{item.retryCount}/{item.maxRetries}</td>
                <td className="p-4 text-xs text-red-400 max-w-xs truncate">{item.errorMessage ?? '—'}</td>
                <td className="p-4 text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="p-4">
                  {['failed', 'max_retries'].includes(item.status) && (
                    <QueueRetry itemId={item.id} />
                  )}
                </td>
              </tr>
            ))}
            {queue.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-zinc-600">Queue is empty</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
