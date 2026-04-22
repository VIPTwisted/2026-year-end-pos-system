import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const device = await prisma.fiscalDevice.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    })
    if (!device) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(device)
  } catch (error) {
    console.error('[GET /api/fiscal/devices/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch device' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    const device = await prisma.fiscalDevice.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.deviceType !== undefined ? { deviceType: body.deviceType } : {}),
        ...(body.manufacturer !== undefined ? { manufacturer: body.manufacturer } : {}),
        ...(body.model !== undefined ? { model: body.model } : {}),
        ...(body.serialNumber !== undefined ? { serialNumber: body.serialNumber } : {}),
        ...(body.registerId !== undefined ? { registerId: body.registerId } : {}),
        ...(body.storeId !== undefined ? { storeId: body.storeId } : {}),
        ...(body.storeName !== undefined ? { storeName: body.storeName } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.ipAddress !== undefined ? { ipAddress: body.ipAddress } : {}),
        ...(body.port !== undefined ? { port: body.port } : {}),
        ...(body.errorMessage !== undefined ? { errorMessage: body.errorMessage } : {}),
      },
    })

    return NextResponse.json(device)
  } catch (error) {
    console.error('[PATCH /api/fiscal/devices/[id]]', error)
    return NextResponse.json({ error: 'Failed to update device' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.fiscalDevice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/fiscal/devices/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete device' }, { status: 500 })
  }
}
