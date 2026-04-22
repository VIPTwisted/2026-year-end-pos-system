import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const where = status && status !== 'all' ? { status } : {}
    const orders = await prisma.salesOrder.findMany({
      where,
      include: { items: true, invoices: true, quote: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const order = await prisma.salesOrder.create({
      data: body,
      include: { items: true },
    })
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
