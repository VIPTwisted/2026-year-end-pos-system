import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const asset = await prisma.fixedAsset.findUnique({
    where: { id },
    include: {
      class: true,
      subclass: true,
      depreciationBooks: true,
      ledgerEntries: {
        orderBy: { postingDate: 'desc' },
        take: 20,
      },
      insurances: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  return NextResponse.json(asset)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const asset = await prisma.fixedAsset.findUnique({ where: { id } })
  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  const updated = await prisma.fixedAsset.update({
    where: { id },
    data: {
      description: body.description !== undefined ? body.description : undefined,
      location: body.location !== undefined ? body.location : undefined,
      status: body.status !== undefined ? body.status : undefined,
      notes: body.notes !== undefined ? body.notes : undefined,
      responsibleEmployee: body.responsibleEmployee !== undefined ? body.responsibleEmployee : undefined,
      serialNumber: body.serialNumber !== undefined ? body.serialNumber : undefined,
    },
    include: {
      class: true,
      subclass: true,
      depreciationBooks: true,
    },
  })

  return NextResponse.json(updated)
}
