import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface HardwareProfilePatch {
  name?: string
  description?: string
  printerType?: string
  printerPort?: string
  printerWidth?: number
  cashDrawerPort?: string
  cashDrawerOpenCode?: string
  paymentTerminalType?: string
  paymentTerminalPort?: string
  paymentTerminalId?: string
  barcodeScanner?: string
  customerDisplay?: boolean
  customerDisplayPort?: string
  signatureCapture?: boolean
  isActive?: boolean
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profile = await prisma.hardwareProfile.findUnique({
      where: { id },
      include: { registers: { select: { id: true, name: true, registerId: true } } },
    })
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(profile)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch hardware profile' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: HardwareProfilePatch = await req.json()
    const profile = await prisma.hardwareProfile.update({ where: { id }, data: body })
    return NextResponse.json(profile)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update hardware profile' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const linked = await prisma.posRegister.count({ where: { hardwareProfileId: id } })
    if (linked > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${linked} register(s) are linked to this profile` },
        { status: 409 }
      )
    }
    await prisma.hardwareProfile.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete hardware profile' }, { status: 500 })
  }
}
