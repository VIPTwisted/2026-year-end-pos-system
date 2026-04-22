import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface PosRegisterPatch {
  name?: string
  registerId?: string
  storeId?: string
  hardwareProfileId?: string | null
  functionalityProfileId?: string | null
  receiptProfileId?: string | null
  isActive?: boolean
  isOnline?: boolean
  ipAddress?: string
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const register = await prisma.posRegister.findUnique({
      where: { id },
      include: {
        store: { select: { id: true, name: true } },
        hardwareProfile: true,
        functionalityProfile: true,
        receiptProfile: true,
      },
    })
    if (!register) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(register)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch register' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: PosRegisterPatch = await req.json()
    const register = await prisma.posRegister.update({ where: { id }, data: body })
    return NextResponse.json(register)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update register' }, { status: 500 })
  }
}
