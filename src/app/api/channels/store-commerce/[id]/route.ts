import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const device = await prisma.storeCommerceDevice.findUnique({
      where: { id: params.id },
      include: { store: { select: { id: true, name: true } } },
    })
    if (!device) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(device)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { action, ...rest } = body

    if (action === 'activate') {
      const updated = await prisma.storeCommerceDevice.update({
        where: { id: params.id },
        data: {
          activationStatus: 'active',
          lastSeenAt: new Date(),
          activationCode: null,
        },
      })
      return NextResponse.json(updated)
    }

    if (action === 'deactivate') {
      const updated = await prisma.storeCommerceDevice.update({
        where: { id: params.id },
        data: { activationStatus: 'inactive' },
      })
      return NextResponse.json(updated)
    }

    const updated = await prisma.storeCommerceDevice.update({
      where: { id: params.id },
      data: {
        deviceName: rest.deviceName,
        deviceType: rest.deviceType,
        storeId: rest.storeId || null,
        registerId: rest.registerId || null,
        cloudPOSUrl: rest.cloudPOSUrl || null,
        hardwareProfileId: rest.hardwareProfileId || null,
        offlineEnabled: rest.offlineEnabled,
      },
    })
    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
