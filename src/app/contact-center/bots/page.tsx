import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function BotsPage() {
  const bots = await prisma.contactCenterBot.findMany({
    include: { _count: { select: { intents: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <>
      <TopBar title="Bots & AI" />
    <div className="p-6 space-y-5 min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Bots & AI</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Automate first-contact with rule-based or AI-powered bots</p>
        </div>
        <Link
          href="/contact-center/bots/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Bot
        </Link>
      </div>

      <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Name</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Type</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Channel</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Handoff Condition</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Intents</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Active</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {bots.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-600">No bots configured</td></tr>
            )}
            {bots.map(bot => (
              <tr key={bot.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-200">{bot.name}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', bot.type === 'ai_powered' ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-700/20 text-zinc-400')}>
                    {bot.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">{bot.channelType}</span>
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{bot.handoffCondition.replace('_', ' ')}</td>
                <td className="px-4 py-3 text-zinc-400 tabular-nums">{bot._count.intents}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', bot.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/20 text-zinc-500')}>
                    {bot.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/contact-center/bots/${bot.id}`} className="text-xs text-blue-400 hover:text-blue-300">Manage →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  )
}
