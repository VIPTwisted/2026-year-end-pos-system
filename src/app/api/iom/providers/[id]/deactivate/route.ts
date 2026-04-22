import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.fulfillmentProviderInstance.findFirst({ where: { providerId: id } })
  if (existing) {
    await prisma.fulfillmentProviderInstance.update({
      where: { id: existing.id },
      data: { status: 'inactive' },
    })
  }
  await prisma.fulfillmentProvider.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ message: 'Provider deactivated' })
}
