import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const activityType = searchParams.get('activityType')
    const status = searchParams.get('status')
    const accountId = searchParams.get('accountId')
    const contactId = searchParams.get('contactId')
    const overdue = searchParams.get('overdue')

    const where: Record<string, unknown> = {}
    if (activityType && activityType !== 'all') where.activityType = activityType
    if (status && status !== 'all') where.status = status
    if (accountId) where.accountId = accountId
    if (contactId) where.contactId = contactId
    if (overdue === 'true') {
      where.dueDate = { lt: new Date() }
      where.status = 'open'
    }

    const activities = await prisma.cRMActivity.findMany({
      where,
      include: {
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(activities)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const activity = await prisma.cRMActivity.create({
      data: body,
      include: {
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    })
    return NextResponse.json(activity, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
