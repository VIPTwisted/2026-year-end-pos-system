import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface HardwareProfileBody {
  name: string
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

export async function GET() {
  try {
    const profiles = await prisma.hardwareProfile.findMany({
      include: { registers: { select: { id: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(profiles)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch hardware profiles' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: HardwareProfileBody = await req.json()
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const profile = await prisma.hardwareProfile.create({ data: body })
    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create hardware profile' }, { status: 500 })
  }
}
