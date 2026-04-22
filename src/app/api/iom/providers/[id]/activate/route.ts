import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const provider = await prisma.fulfillmentProvider.findUnique({ where: { id } })
  if (!provider) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await prisma.fulfillmentProviderInstance.findFirst({ where: { providerId: id } })

  let instance
  if (existing) {
    instance = await prisma.fulfillmentProviderInstance.update({
      where: { id: existing.id },
      data: { status: 'active', activatedAt: new Date(), lastHeartbeat: new Date(), errorLog: null },
    })
  } else {
    instance = await prisma.fulfillmentProviderInstance.create({
      data: {
        providerId: id,
        name: `${provider.name} Instance`,
        status: 'active',
        activatedAt: new Date(),
        lastHeartbeat: new Date(),
      },
    })
  }

  await prisma.fulfillmentProvider.update({ where: { id }, data: { isActive: true } })

  return NextResponse.json({ instance, message: 'Provider activated' })
}
