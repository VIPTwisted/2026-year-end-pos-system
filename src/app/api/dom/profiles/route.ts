import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const profiles = await prisma.domProfile.findMany({
      include: {
        _count: { select: { rules: true, fulfillmentGroups: true } },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(profiles)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, isDefault, maxFulfillSplits, costWeight, distanceWeight, inventoryWeight, allowPartialFill } = body

    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    if (isDefault) {
      await prisma.domProfile.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
    }

    const profile = await prisma.domProfile.create({
      data: {
        name,
        isDefault: isDefault ?? false,
        maxFulfillSplits: maxFulfillSplits ?? 3,
        costWeight: costWeight ?? 0.4,
        distanceWeight: distanceWeight ?? 0.3,
        inventoryWeight: inventoryWeight ?? 0.3,
        allowPartialFill: allowPartialFill ?? true,
      },
    })
    return NextResponse.json(profile, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
