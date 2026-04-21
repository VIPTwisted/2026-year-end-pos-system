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
      group: true,
      depreciationLines: {
        orderBy: [{ fiscalYear: 'asc' }, { periodNumber: 'asc' }],
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

  const existing = await prisma.fixedAsset.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  type UpdateData = {
    name?: string
    description?: string | null
    location?: string | null
    serialNumber?: string | null
    notes?: string | null
    status?: string
    disposedAt?: Date | null
    disposalAmount?: number | null
  }

  const data: UpdateData = {}

  if ('name' in body) data.name = body.name
  if ('description' in body) data.description = body.description ?? null
  if ('location' in body) data.location = body.location ?? null
  if ('serialNumber' in body) data.serialNumber = body.serialNumber ?? null
  if ('notes' in body) data.notes = body.notes ?? null
  if ('status' in body) data.status = body.status
  if ('disposedAt' in body) data.disposedAt = body.disposedAt ? new Date(body.disposedAt) : null
  if ('disposalAmount' in body) data.disposalAmount = body.disposalAmount ?? null

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
  }

  const asset = await prisma.fixedAsset.update({
    where: { id },
    data,
    include: { group: true },
  })

  return NextResponse.json(asset)
}
