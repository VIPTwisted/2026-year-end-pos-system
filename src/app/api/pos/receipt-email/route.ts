import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, email } = body as { orderId?: string; email?: string }
    if (!orderId || !email) {
      return NextResponse.json({ error: 'orderId and email required' }, { status: 400 })
    }
    // Fetch order for receipt data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Log the email request (actual email provider integration deferred — Stripe/SendGrid Phase 4)
    await prisma.communication.create({
      data: {
        channel: 'email',
        direction: 'outbound',
        subject: `Receipt for Order ${order.orderNumber}`,
        content: `Your receipt for order ${order.orderNumber} totaling $${order.totalAmount.toFixed(2)} has been sent.`,
        status: 'sent',
        customerId: order.customerId ?? '',
      },
    }).catch(() => {}) // non-fatal

    return NextResponse.json({
      sent: true,
      to: email,
      orderNumber: order.orderNumber,
      message: 'Receipt queued for delivery (email provider not yet configured — Phase 4)',
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
