import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface StorePaymentMethodPatch {
  displayName?: string
  isActive?: boolean
  allowChange?: boolean
  allowOverTender?: boolean
  maxOverTender?: number | null
  minAmount?: number | null
  maxAmount?: number | null
  requireSignature?: boolean
  signatureThreshold?: number | null
  processorType?: string | null
  processorId?: string | null
  sortOrder?: number
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: StorePaymentMethodPatch = await req.json()
    const method = await prisma.storePaymentMethod.update({ where: { id }, data: body })
    return NextResponse.json(method)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.storePaymentMethod.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 })
  }
}
