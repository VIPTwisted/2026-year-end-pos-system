import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const profile = await prisma.hardwareProfile.findUnique({ where: { id } })
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    return NextResponse.json(profile)
  } catch (err) {
    console.error('[hardware-profile GET]', err)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const {
      name,
      printerType,
      printerIp,
      drawerPort,
      scannerType,
      paymentTerminal,
      paymentIp,
      displayType,
      signatureCapture,
    } = body as {
      name?: string
      printerType?: string
      printerIp?: string
      drawerPort?: string
      scannerType?: string
      paymentTerminal?: string
      paymentIp?: string
      displayType?: string
      signatureCapture?: boolean
    }

    const profile = await prisma.hardwareProfile.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(printerType !== undefined && { printerType }),
        ...(printerIp !== undefined && { printerIp: printerIp || null }),
        ...(drawerPort !== undefined && { drawerPort: drawerPort || null }),
        ...(scannerType !== undefined && { scannerType }),
        ...(paymentTerminal !== undefined && { paymentTerminal }),
        ...(paymentIp !== undefined && { paymentIp: paymentIp || null }),
        ...(displayType !== undefined && { displayType }),
        ...(signatureCapture !== undefined && { signatureCapture }),
      },
    })

    return NextResponse.json(profile)
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    console.error('[hardware-profile PATCH]', err)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
