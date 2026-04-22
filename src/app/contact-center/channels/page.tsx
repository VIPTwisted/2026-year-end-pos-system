import { prisma } from '@/lib/prisma'
import ChannelsClient from './ChannelsClient'

export const dynamic = 'force-dynamic'

export default async function ChannelsPage() {
  const channels = await prisma.contactChannel.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { conversations: true } } },
  })
  return <ChannelsClient channels={channels as Parameters<typeof ChannelsClient>[0]['channels']} />
}
