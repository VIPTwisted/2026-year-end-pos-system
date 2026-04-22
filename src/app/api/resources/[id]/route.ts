import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      skills: { orderBy: { skillName: 'asc' } },
      bookings: { orderBy: { startDate: 'asc' } },
    },
  })
  if (!resource) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(resource)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { name, type, unitCost, unitPrice, capacity, isActive } = body

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(type !== undefined && { type }),
        ...(unitCost !== undefined && { unitCost: parseFloat(unitCost) }),
        ...(unitPrice !== undefined && { unitPrice: parseFloat(unitPrice) }),
        ...(capacity !== undefined && { capacity: parseFloat(capacity) }),
        ...(isActive !== undefined && { isActive }),
      },
    })
    return NextResponse.json(resource)
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.resource.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
