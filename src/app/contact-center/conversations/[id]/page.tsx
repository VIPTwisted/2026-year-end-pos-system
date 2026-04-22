import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import AgentWorkspace from './AgentWorkspace'

export const dynamic = 'force-dynamic'

export default async function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      channel: true,
      customer: true,
      messages: { orderBy: { createdAt: 'asc' } },
      transfers: { orderBy: { transferredAt: 'asc' } },
    },
  })
  if (!conversation) notFound()

  const wrapUpCodes = await prisma.wrapUpCode.findMany({ where: { isActive: true }, orderBy: { category: 'asc' } })

  return <AgentWorkspace conversation={conversation as Parameters<typeof AgentWorkspace>[0]['conversation']} wrapUpCodes={wrapUpCodes} />
}
