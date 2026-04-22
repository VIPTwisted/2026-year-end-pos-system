import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') ?? ''
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50')

  const orders = await prisma.order.findMany({
    where: search
      ? {
          OR: [
            { orderNumber: { contains: search } },
            { customer: { firstName: { contains: search } } },
            { customer: { lastName: { contains: search } } },
          ],
        }
      : undefined,
    include: {
      customer: true,
      items: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const store = await prisma.store.findFirst()
  if (!store) return NextResponse.json({ error: 'No store configured' }, { status: 400 })

  // Support split payments array or legacy single paymentMethod
  const paymentsData: Array<{ method: string; amount: number; reference?: string }> =
    Array.isArray(body.payments) && body.payments.length > 0
      ? body.payments
      : [{ method: body.paymentMethod ?? 'card', amount: body.totalAmount }]

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      storeId: store.id,
      customerId: body.customerId ?? undefined,
      status: body.isReturn ? 'return' : 'paid',
      subtotal: body.subtotal,
      taxAmount: body.taxAmount,
      discountAmount: body.discountAmount ?? 0,
      totalAmount: body.totalAmount,
      paymentMethod: paymentsData.map(p => p.method).join('+'),
      amountTendered: body.amountTendered ?? body.totalAmount,
      changeDue: body.changeDue ?? 0,
      items: {
        create: body.items.map((item: {
          productId: string
          productName: string
          sku: string
          quantity: number
          unitPrice: number
          discount?: number
          taxAmount: number
          lineTotal: number
        }) => ({
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount ?? 0,
          taxAmount: item.taxAmount,
          lineTotal: item.lineTotal,
        })),
      },
      payments: {
        create: paymentsData.map(p => ({
          method: p.method,
          amount: p.amount,
          reference: p.reference,
          status: 'completed',
        })),
      },
    },
    include: { items: true, payments: true },
  })

  // Update customer stats if customerId provided
  if (body.customerId && !body.isReturn) {
    await prisma.customer.update({
      where: { id: body.customerId },
      data: {
        totalSpent: { increment: Math.max(0, body.totalAmount) },
        visitCount: { increment: 1 },
        loyaltyPoints: { increment: Math.floor(Math.max(0, body.totalAmount)) },
      },
    })
  }

  return NextResponse.json(order, { status: 201 })
}
