import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const devices = await prisma.storeCommerceDevice.findMany({
      orderBy: { createdAt: 'desc' },
      include: { store: { select: { id: true, name: true } } },
    })
    return NextResponse.json(devices)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { deviceName, deviceType, storeId, registerId, cloudPOSUrl,
            hardwareProfileId, offlineEnabled, appVersion, osInfo } = body

    if (!deviceName) {
      return NextResponse.json({ error: 'deviceName is required' }, { status: 400 })
    }

    const deviceId = `DEV-${randomBytes(4).toString('hex').toUpperCase()}`
    const activationCode = randomBytes(3).toString('hex').toUpperCase()

    const device = await prisma.storeCommerceDevice.create({
      data: {
        deviceId,
        deviceName,
        deviceType: deviceType || 'StoreCommerce',
        storeId: storeId || null,
        registerId: registerId || null,
        cloudPOSUrl: cloudPOSUrl || null,
        hardwareProfileId: hardwareProfileId || null,
        offlineEnabled: offlineEnabled ?? false,
        appVersion: appVersion || null,
        osInfo: osInfo || null,
        activationCode,
        activationStatus: 'pending',
      },
    })

    return NextResponse.json(device, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
