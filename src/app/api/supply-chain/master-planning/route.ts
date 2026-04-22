import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type   = searchParams.get('type')   // 'net-req' | 'planned' | 'firmed'
  const status = searchParams.get('status')
  const orderType = searchParams.get('orderType')

  try {
    if (type === 'planned') {
      const orders = await prisma.plannedOrder.findMany({
        where: {
          ...(status    ? { status }             : {}),
          ...(orderType ? { orderType }           : {}),
        },
        orderBy: { requiredDate: 'asc' },
        take: 300,
      })
      return NextResponse.json(orders)
    }
    if (type === 'firmed') {
      const orders = await prisma.plannedOrder.findMany({
        where: { status: 'Firmed' },
        orderBy: { requiredDate: 'asc' },
        take: 300,
      })
      return NextResponse.json(orders)
    }
    // net requirements
    const reqs = await prisma.netRequirement.findMany({
      orderBy: { demandDate: 'asc' },
      take: 300,
    })
    return NextResponse.json(reqs)
  } catch {
    return NextResponse.json({ error: 'Master planning data unavailable' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  try {
    const body = await req.json()
    if (type === 'firm') {
      // Firm a planned order
      const { id } = body
      const updated = await prisma.plannedOrder.update({
        where: { id },
        data: { status: 'Firmed' },
      })
      return NextResponse.json(updated)
    }
    const order = await prisma.plannedOrder.create({ data: body })
    return NextResponse.json(order, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to process planned order' }, { status: 500 })
  }
}
