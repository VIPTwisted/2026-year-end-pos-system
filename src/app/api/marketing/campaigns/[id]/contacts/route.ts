import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const contacts = await prisma.campaignContact.findMany({
    where: { campaignId: id },
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(contacts)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { customerId } = body

  if (!customerId) {
    return NextResponse.json({ error: 'customerId is required' }, { status: 400 })
  }

  const existing = await prisma.campaign.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  // upsert to respect @@unique([campaignId, customerId])
  const contact = await prisma.campaignContact.upsert({
    where: { campaignId_customerId: { campaignId: id, customerId } },
    create: { campaignId: id, customerId, status: 'pending' },
    update: {},
    include: { customer: true },
  })

  return NextResponse.json(contact, { status: 201 })
}
