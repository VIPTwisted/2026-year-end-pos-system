import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const groups = await prisma.domFulfillmentGroup.findMany({
      where: { profileId: id },
      orderBy: { priority: 'asc' },
    })
    return NextResponse.json(groups)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, groupType, locationIds, priority, maxOrders } = body

    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const group = await prisma.domFulfillmentGroup.create({
      data: {
        profileId: id,
        name,
        groupType: groupType ?? 'store',
        locationIds: Array.isArray(locationIds) ? JSON.stringify(locationIds) : (locationIds ?? '[]'),
        priority: priority ?? 0,
        maxOrders: maxOrders ?? null,
      },
    })
    return NextResponse.json(group, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
