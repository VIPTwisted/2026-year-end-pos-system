import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { deviceName, deviceType, storeCode, registerId, cloudPOSUrl, hardwareProfileId } = body

    if (!deviceName || !deviceType) {
      return NextResponse.json({ error: 'deviceName and deviceType are required' }, { status: 400 })
    }

    const deviceId = `DEV-${randomBytes(4).toString('hex').toUpperCase()}`
    const activationCode = `${randomBytes(2).toString('hex').toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`

    // Find store by storeCode if provided
    let storeId: string | null = null
    if (storeCode) {
      const store = await prisma.store.findFirst({ where: { name: { contains: storeCode } } })
      storeId = store?.id ?? null
    }

    const device = await prisma.storeCommerceDevice.create({
      data: {
        deviceId,
        deviceName,
        deviceType,
        storeId,
        registerId: registerId || null,
        cloudPOSUrl: cloudPOSUrl || null,
        hardwareProfileId: hardwareProfileId || null,
        activationCode,
        activationStatus: 'pending',
      },
    })

    return NextResponse.json({ device, activationCode }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
