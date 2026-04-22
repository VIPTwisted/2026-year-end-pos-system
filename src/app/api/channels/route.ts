import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const channels = await prisma.retailChannel.findMany({
    include: { languages: true, paymentAccounts: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(channels)
}

export async function POST(req: Request) {
  const body = await req.json()
  const channel = await prisma.retailChannel.create({
    data: {
      retailChannelId: body.retailChannelId,
      name: body.name,
      searchName: body.searchName,
      channelType: body.channelType ?? 'online_store',
      operatingUnitNumber: body.operatingUnitNumber,
      legalEntity: body.legalEntity,
      warehouse: body.warehouse,
      storeTimeZone: body.storeTimeZone,
      currency: body.currency ?? 'USD',
      defaultCustomerName: body.defaultCustomerName,
      functionalityProfile: body.functionalityProfile,
      pricesIncludeSalesTax: body.pricesIncludeSalesTax ?? false,
      emailNotificationProfile: body.emailNotificationProfile,
      publishingStatus: 'draft',
    },
  })
  return NextResponse.json(channel, { status: 201 })
}
