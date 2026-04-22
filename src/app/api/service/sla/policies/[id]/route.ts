import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const policy = await prisma.sLAPolicy.findUnique({
    where: { id },
    include: { items: { include: { case: { include: { customer: true } } } } },
  })
  if (!policy) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(policy)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const {
    name, description, applicableTo, firstResponseHours, resolutionHours,
    warningThresholdPct, businessHoursOnly, pauseOnHold, isDefault, isActive,
  } = body

  if (isDefault) {
    await prisma.sLAPolicy.updateMany({ where: { id: { not: id } }, data: { isDefault: false } })
  }

  const policy = await prisma.sLAPolicy.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(applicableTo !== undefined ? { applicableTo } : {}),
      ...(firstResponseHours !== undefined ? { firstResponseHours } : {}),
      ...(resolutionHours !== undefined ? { resolutionHours } : {}),
      ...(warningThresholdPct !== undefined ? { warningThresholdPct } : {}),
      ...(businessHoursOnly !== undefined ? { businessHoursOnly } : {}),
      ...(pauseOnHold !== undefined ? { pauseOnHold } : {}),
      ...(isDefault !== undefined ? { isDefault } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
  })
  return NextResponse.json(policy)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.sLAPolicy.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
