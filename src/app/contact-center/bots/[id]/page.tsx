import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BotDetailClient from './BotDetailClient'

export const dynamic = 'force-dynamic'

export default async function BotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const bot = await prisma.contactCenterBot.findUnique({
    where: { id },
    include: { intents: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!bot) notFound()
  return <BotDetailClient bot={bot as Parameters<typeof BotDetailClient>[0]['bot']} />
}
