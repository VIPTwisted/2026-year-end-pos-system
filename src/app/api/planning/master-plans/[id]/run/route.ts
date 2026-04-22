import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PRODUCTS = [
  'Widget Alpha', 'Component Beta', 'Assembly Gamma', 'Module Delta',
  'Part Epsilon', 'Unit Zeta', 'Device Eta', 'Item Theta',
  'Product Iota', 'SKU Kappa', 'Article Lambda', 'Good Mu',
]
const SOURCES = ['Warehouse A', 'Supplier Corp', 'DC East', 'Plant 1', 'Vendor Pro']
const DESTINATIONS = ['Store NYC', 'Store LA', 'DC West', 'Outlet Hub', 'Retail Floor']
const ORDER_TYPES = ['purchase', 'purchase', 'purchase', 'transfer', 'transfer', 'production']
const MSG_TYPES = ['advance', 'postpone', 'increase', 'decrease', 'cancel', 'new-order']
const REASONS = [
  'Demand spike detected', 'Excess inventory on hand', 'Lead time constraint',
  'Supplier delay', 'Coverage gap identified', 'Safety stock breach',
  'Seasonal adjustment', 'Forecast deviation >15%',
]

function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick<T>(arr: T[]): T { return arr[rnd(0, arr.length - 1)] }
function futureDate(daysAhead: number) {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const plan = await (prisma as any).masterPlan.findUnique({ where: { id } })
    if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await (prisma as any).masterPlan.update({ where: { id }, data: { status: 'running' } })
    await (prisma as any).plannedOrder.deleteMany({ where: { planId: id } })
    await (prisma as any).actionMessage.deleteMany({ where: { planId: id } })

    const orderCount = rnd(10, 20)
    const orderData = Array.from({ length: orderCount }).map(() => ({
      planId: id,
      orderType: pick(ORDER_TYPES),
      productName: pick(PRODUCTS),
      qty: rnd(5, 500),
      needDate: futureDate(rnd(1, plan.horizon)),
      sourceName: pick(SOURCES),
      destinationName: pick(DESTINATIONS),
      status: 'planned',
    }))
    await (prisma as any).plannedOrder.createMany({ data: orderData })

    const msgCount = rnd(5, 10)
    const msgData = Array.from({ length: msgCount }).map(() => ({
      planId: id,
      messageType: pick(MSG_TYPES),
      productName: pick(PRODUCTS),
      currentDate: futureDate(rnd(1, 30)),
      suggestedDate: futureDate(rnd(1, plan.horizon)),
      currentQty: rnd(10, 200),
      suggestedQty: rnd(5, 300),
      reason: pick(REASONS),
      status: 'open',
    }))
    await (prisma as any).actionMessage.createMany({ data: msgData })

    const updated = await (prisma as any).masterPlan.update({
      where: { id },
      data: { status: 'completed', lastRunAt: new Date() },
    })

    return NextResponse.json({ ok: true, ordersGenerated: orderCount, messagesGenerated: msgCount, plan: updated })
  } catch (e) {
    await (prisma as any).masterPlan.update({ where: { id: (await params).id }, data: { status: 'failed' } }).catch(() => {})
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
