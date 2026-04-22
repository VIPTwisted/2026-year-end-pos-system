import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const profiles = await prisma.hardwareProfile.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(profiles)
  } catch (err) {
    console.error('[hardware-profiles GET]', err)
    return NextResponse.json({ error: 'Failed to fetch hardware profiles' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      profileId,
      name,
      printerType = 'none',
      printerIp,
      drawerPort,
      scannerType = 'none',
      paymentTerminal = 'none',
      paymentIp,
      displayType = 'none',
      signatureCapture = false,
    } = body as {
      profileId: string
      name: string
      printerType?: string
      printerIp?: string
      drawerPort?: string
      scannerType?: string
      paymentTerminal?: string
      paymentIp?: string
      displayType?: string
      signatureCapture?: boolean
    }

    if (!profileId?.trim()) return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    const profile = await prisma.hardwareProfile.create({
      data: {
        profileId: profileId.trim().toUpperCase(),
        name: name.trim(),
        printerType,
        printerIp: printerIp || null,
        drawerPort: drawerPort || null,
        scannerType,
        paymentTerminal,
        paymentIp: paymentIp || null,
        displayType,
        signatureCapture,
      },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Profile ID already exists' }, { status: 409 })
    }
    console.error('[hardware-profiles POST]', err)
    return NextResponse.json({ error: 'Failed to create hardware profile' }, { status: 500 })
  }
}
