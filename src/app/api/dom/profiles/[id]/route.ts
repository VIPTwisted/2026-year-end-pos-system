import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const profile = await prisma.domProfile.findUnique({
      where: { id },
      include: {
        rules: { orderBy: { priority: 'asc' } },
        fulfillmentGroups: { orderBy: { priority: 'asc' } },
      },
    })
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(profile)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    if (body.isDefault === true) {
      await prisma.domProfile.updateMany({ where: { isDefault: true, id: { not: id } }, data: { isDefault: false } })
    }

    const profile = await prisma.domProfile.update({
      where: { id },
      data: {
        name: body.name,
        isDefault: body.isDefault,
        maxFulfillSplits: body.maxFulfillSplits,
        costWeight: body.costWeight,
        distanceWeight: body.distanceWeight,
        inventoryWeight: body.inventoryWeight,
        allowPartialFill: body.allowPartialFill,
      },
    })
    return NextResponse.json(profile)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.domProfile.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
