import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const groups = await prisma.fulfillmentGroup.findMany({
    include: { stores: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(groups)
}

export async function POST(req: Request) {
  const body = await req.json()
  const group = await prisma.fulfillmentGroup.create({
    data: { name: body.name, fulfillmentType: body.fulfillmentType ?? 'pickup' },
  })
  return NextResponse.json(group, { status: 201 })
}
