import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const segment = await prisma.crmSegment.findUnique({ where: { id } })
  if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const criteria = JSON.parse(segment.criteria || '{}')
  let base = Math.floor(Math.random() * 2000) + 500
  if (criteria.minLTV) base = Math.floor(base * 0.6)
  if (criteria.tier === 'VIP') base = Math.floor(base * 0.15)
  if (criteria.tier === 'Premium') base = Math.floor(base * 0.35)
  if (criteria.lastPurchaseDays) base = Math.floor(base * 0.7)

  const updated = await prisma.crmSegment.update({
    where: { id },
    data: { memberCount: base, lastRefreshed: new Date() },
  })
  return NextResponse.json(updated)
}
