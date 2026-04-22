import { prisma } from '@/lib/prisma'
import AgentsClient from './AgentsClient'

export const dynamic = 'force-dynamic'

export default async function AgentsPage() {
  const presences = await prisma.agentPresence.findMany({ orderBy: { agentName: 'asc' } })
  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <AgentsClient presences={presences as Parameters<typeof AgentsClient>[0]['presences']} />
    </div>
  )
}
