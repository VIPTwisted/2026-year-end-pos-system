import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface PosRegisterBody {
  name: string
  registerId: string
  storeId: string
  hardwareProfileId?: string
  functionalityProfileId?: string
  receiptProfileId?: string
  isActive?: boolean
  ipAddress?: string
}

export async function GET() {
  try {
    const registers = await prisma.posRegister.findMany({
      include: {
        store: { select: { id: true, name: true } },
        hardwareProfile: { select: { id: true, name: true } },
        functionalityProfile: { select: { id: true, name: true } },
        receiptProfile: { select: { id: true, name: true } },
      },
      orderBy: { registerId: 'asc' },
    })
    return NextResponse.json(registers)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch registers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: PosRegisterBody = await req.json()
    if (!body.name || !body.registerId || !body.storeId) {
      return NextResponse.json({ error: 'name, registerId, and storeId are required' }, { status: 400 })
    }
    const register = await prisma.posRegister.create({ data: body })
    return NextResponse.json(register, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create register' }, { status: 500 })
  }
}
