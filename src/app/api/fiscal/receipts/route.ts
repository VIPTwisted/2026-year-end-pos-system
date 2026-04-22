import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateReceiptNumber(): string {
  const num = Math.floor(Math.random() * 900000) + 100000
  return `RCP-${num}`
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const deliveryMethod = searchParams.get('deliveryMethod')
    const receipts = await prisma.electronicReceipt.findMany({
      where: {
        ...(status && status !== 'all' ? { status } : {}),
        ...(deliveryMethod ? { deliveryMethod } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return NextResponse.json(receipts)
  } catch (error) {
    console.error('[GET /api/fiscal/receipts]', error)
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transactionId, customerEmail, customerPhone, deliveryMethod, storeName, storeAddress, items, subtotal, tax, total, paymentMethod, loyaltyPoints } = body
    let receiptNumber = generateReceiptNumber()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.electronicReceipt.findUnique({ where: { receiptNumber } })
      if (!existing) break
      receiptNumber = generateReceiptNumber()
      attempts++
    }
    const receipt = await prisma.electronicReceipt.create({
      data: {
        receiptNumber,
        transactionId: transactionId ?? null,
        customerEmail: customerEmail ?? null,
        customerPhone: customerPhone ?? null,
        deliveryMethod: deliveryMethod ?? 'email',
        status: 'pending',
        storeName: storeName ?? null,
        storeAddress: storeAddress ?? null,
        items: items ? (typeof items === 'string' ? items : JSON.stringify(items)) : '[]',
        subtotal: subtotal ? Number(subtotal) : 0,
        tax: tax ? Number(tax) : 0,
        total: total ? Number(total) : 0,
        paymentMethod: paymentMethod ?? null,
        loyaltyPoints: loyaltyPoints ? Number(loyaltyPoints) : 0,
      },
    })
    return NextResponse.json(receipt, { status: 201 })
  } catch (error) {
    console.error('[POST /api/fiscal/receipts]', error)
    return NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 })
  }
}
