import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get('customerId')
  const listId = searchParams.get('listId')
  const activityType = searchParams.get('activityType')

  const activities = await prisma.clientActivity.findMany({
    where: {
      ...(customerId ? { customerId } : {}),
      ...(listId ? { listId } : {}),
      ...(activityType ? { activityType } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json(activities)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const activity = await prisma.clientActivity.create({
    data: {
      listId: body.listId || null,
      customerId: body.customerId || null,
      customerName: body.customerName || null,
      activityType: body.activityType,
      subject: body.subject || null,
      notes: body.notes,
      outcome: body.outcome || null,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      recordedBy: body.recordedBy || null,
    },
  })
  return NextResponse.json(activity, { status: 201 })
}
