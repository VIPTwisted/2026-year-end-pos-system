import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface StorePaymentMethodBody {
  storeId: string
  method: string
  displayName: string
  isActive?: boolean
  allowChange?: boolean
  allowOverTender?: boolean
  maxOverTender?: number
  minAmount?: number
  maxAmount?: number
  requireSignature?: boolean
  signatureThreshold?: number
  processorType?: string
  processorId?: string
  sortOrder?: number
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get('storeId')
    const methods = await prisma.storePaymentMethod.findMany({
      where: storeId ? { storeId } : undefined,
      include: { store: { select: { id: true, name: true } } },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(methods)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: StorePaymentMethodBody = await req.json()
    if (!body.storeId || !body.method || !body.displayName) {
      return NextResponse.json({ error: 'storeId, method, and displayName are required' }, { status: 400 })
    }
    const method = await prisma.storePaymentMethod.create({ data: body })
    return NextResponse.json(method, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create payment method' }, { status: 500 })
  }
}
