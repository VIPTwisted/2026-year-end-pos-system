import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const storeId = searchParams.get('storeId')

    const devices = await prisma.fiscalDevice.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(storeId ? { storeId } : {}),
      },
      include: {
        _count: { select: { documents: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(devices)
  } catch (error) {
    console.error('[GET /api/fiscal/devices]', error)
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, deviceType, manufacturer, model, serialNumber, registerId, storeId, storeName, ipAddress, port } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const device = await prisma.fiscalDevice.create({
      data: {
        name,
        deviceType: deviceType ?? 'fiscal-printer',
        manufacturer: manufacturer ?? null,
        model: model ?? null,
        serialNumber: serialNumber ?? null,
        registerId: registerId ?? null,
        storeId: storeId ?? null,
        storeName: storeName ?? null,
        ipAddress: ipAddress ?? null,
        port: port ? Number(port) : null,
        status: 'active',
      },
    })

    return NextResponse.json(device, { status: 201 })
  } catch (error) {
    console.error('[POST /api/fiscal/devices]', error)
    return NextResponse.json({ error: 'Failed to create device' }, { status: 500 })
  }
}
