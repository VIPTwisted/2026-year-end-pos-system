import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const records = await prisma.fAMaintenanceLedger.findMany({
    where: { assetId: id },
    orderBy: { serviceDate: 'desc' },
  })

  return NextResponse.json(records)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  if (!body.description?.trim()) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 })
  }

  const asset = await prisma.fixedAsset.findUnique({ where: { id } })
  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  const record = await prisma.fAMaintenanceLedger.create({
    data: {
      assetId: id,
      maintenanceCode: body.maintenanceCode ?? null,
      description: body.description.trim(),
      amount: typeof body.amount === 'number' ? body.amount : 0,
      performedBy: body.vendor ?? null,
      serviceDate: body.serviceDate ? new Date(body.serviceDate) : new Date(),
      nextDueDate: body.nextServiceDate ? new Date(body.nextServiceDate) : null,
    },
  })

  return NextResponse.json(record, { status: 201 })
}
