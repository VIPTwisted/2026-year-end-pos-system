import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const receipt = await prisma.electronicReceipt.findUnique({ where: { id } })
    if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(receipt)
  } catch (error) {
    console.error('[GET /api/fiscal/receipts/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch receipt' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const receipt = await prisma.electronicReceipt.update({
      where: { id },
      data: {
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.customerEmail !== undefined ? { customerEmail: body.customerEmail } : {}),
        ...(body.customerPhone !== undefined ? { customerPhone: body.customerPhone } : {}),
        ...(body.deliveryMethod !== undefined ? { deliveryMethod: body.deliveryMethod } : {}),
        ...(body.sentAt !== undefined ? { sentAt: body.sentAt ? new Date(body.sentAt) : null } : {}),
        ...(body.deliveredAt !== undefined ? { deliveredAt: body.deliveredAt ? new Date(body.deliveredAt) : null } : {}),
        ...(body.openedAt !== undefined ? { openedAt: body.openedAt ? new Date(body.openedAt) : null } : {}),
      },
    })
    return NextResponse.json(receipt)
  } catch (error) {
    console.error('[PATCH /api/fiscal/receipts/[id]]', error)
    return NextResponse.json({ error: 'Failed to update receipt' }, { status: 500 })
  }
}
