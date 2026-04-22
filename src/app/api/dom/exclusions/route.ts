import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const exclusions = await prisma.domExclusion.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(exclusions)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { locationId, locationName, reason, startDate, endDate, isActive } = body

    if (!reason || !startDate) {
      return NextResponse.json({ error: 'reason and startDate required' }, { status: 400 })
    }

    const exclusion = await prisma.domExclusion.create({
      data: {
        locationId: locationId ?? null,
        locationName: locationName ?? null,
        reason,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive ?? true,
      },
    })
    return NextResponse.json(exclusion, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
