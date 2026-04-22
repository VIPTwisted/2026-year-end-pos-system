import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const item = await prisma.serviceItem.findUnique({
    where: { id },
    include: {
      customer: true,
      product: true,
      contract: true,
      serviceCases: {
        include: { partsUsed: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const {
    status, serialNumber, warrantyStart, warrantyEnd,
    lastServiceDate, nextServiceDate, notes, contractId,
  } = body

  const existing = await prisma.serviceItem.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const item = await prisma.serviceItem.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(serialNumber !== undefined ? { serialNumber } : {}),
      ...(warrantyStart !== undefined ? { warrantyStart: warrantyStart ? new Date(warrantyStart) : null } : {}),
      ...(warrantyEnd !== undefined ? { warrantyEnd: warrantyEnd ? new Date(warrantyEnd) : null } : {}),
      ...(lastServiceDate !== undefined ? { lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : null } : {}),
      ...(nextServiceDate !== undefined ? { nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(contractId !== undefined ? { contractId } : {}),
    },
    include: { customer: true, product: true },
  })
  return NextResponse.json(item)
}
