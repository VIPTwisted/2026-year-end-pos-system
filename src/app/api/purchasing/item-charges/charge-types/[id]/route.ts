import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      name?: string
      description?: string
      glAccountId?: string
      isActive?: boolean
    }

    const chargeType = await prisma.itemChargeType.update({
      where: { id },
      data: {
        ...(body.name != null ? { name: body.name.trim() } : {}),
        ...(body.description != null ? { description: body.description.trim() || null } : {}),
        ...(body.glAccountId != null ? { glAccountId: body.glAccountId.trim() || null } : {}),
        ...(body.isActive != null ? { isActive: body.isActive } : {}),
      },
    })

    return NextResponse.json(chargeType)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
