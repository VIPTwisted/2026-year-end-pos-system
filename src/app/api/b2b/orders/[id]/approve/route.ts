import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await prisma.b2BOrder.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updated = await prisma.b2BOrder.update({
      where: { id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to approve order' }, { status: 500 })
  }
}
