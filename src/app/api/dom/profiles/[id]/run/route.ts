import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MOCK_PRODUCTS = [
  'Sony WH-1000XM5 Headphones',
  'Apple AirPods Pro',
  'Samsung 65" QLED TV',
  'Logitech MX Master 3 Mouse',
  'Dell XPS 15 Laptop',
  'Bose SoundLink Revolve',
  'LG 27" 4K Monitor',
  'Anker 65W Charger',
  'Nintendo Switch OLED',
  'Razer BlackWidow Keyboard',
]

const LOCATIONS = [
  { name: 'Downtown Flagship', type: 'store' },
  { name: 'Westside Mall', type: 'store' },
  { name: 'Main Distribution Center', type: 'dc' },
  { name: 'Northgate Warehouse', type: 'warehouse' },
  { name: 'East Side Store', type: 'store' },
  { name: 'Vendor Direct Ship', type: 'vendor' },
]

const REASONS = [
  'Closest location with available inventory',
  'Highest inventory buffer meets demand',
  'Lowest shipping cost route selected',
  'Priority fulfillment group matched',
  'Split fulfillment: partial stock at nearest',
  'Vendor drop-ship preferred for bulk order',
  'DC routing for cross-region delivery',
  'Capacity limit reached, rerouted to secondary',
]

function rng(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startMs = Date.now()
  try {
    const { id } = await params

    const profile = await prisma.domProfile.findUnique({ where: { id } })
    const profileName = profile?.name ?? 'Default Profile'

    const ordersIn = rng(5, 10)

    const run = await prisma.domOrderRun.create({
      data: {
        profileId: id,
        status: 'running',
        ordersIn,
        ordersRouted: 0,
        ordersFailed: 0,
      },
    })

    const resultData: {
      runId: string
      orderId: string
      orderLine: string
      productName: string
      qty: number
      assignedTo: string
      assignedType: string
      routingScore: number
      splitNumber: number
      reason: string
      status: string
    }[] = []

    let routed = 0
    let failed = 0

    for (let i = 0; i < ordersIn; i++) {
      const orderId = `ORD-${Date.now()}-${i}`
      const product = MOCK_PRODUCTS[i % MOCK_PRODUCTS.length]
      const qty = rng(1, 5)
      const statusRoll = Math.random()

      if (statusRoll < 0.75) {
        const loc = LOCATIONS[rng(0, LOCATIONS.length - 1)]
        resultData.push({
          runId: run.id,
          orderId,
          orderLine: `Line-${i + 1}`,
          productName: product,
          qty,
          assignedTo: loc.name,
          assignedType: loc.type,
          routingScore: parseFloat((Math.random() * 0.4 + 0.6).toFixed(3)),
          splitNumber: 1,
          reason: REASONS[rng(0, REASONS.length - 1)],
          status: 'routed',
        })
        routed++
      } else if (statusRoll < 0.9) {
        const loc1 = LOCATIONS[0]
        const loc2 = LOCATIONS[2]
        const qty1 = Math.ceil(qty / 2)
        const qty2 = qty - qty1
        resultData.push({
          runId: run.id, orderId, orderLine: `Line-${i + 1}`, productName: product,
          qty: qty1, assignedTo: loc1.name, assignedType: loc1.type,
          routingScore: parseFloat((Math.random() * 0.3 + 0.4).toFixed(3)),
          splitNumber: 1, reason: 'Split fulfillment: partial stock at nearest', status: 'partial',
        })
        resultData.push({
          runId: run.id, orderId, orderLine: `Line-${i + 1}`, productName: product,
          qty: qty2, assignedTo: loc2.name, assignedType: loc2.type,
          routingScore: parseFloat((Math.random() * 0.3 + 0.4).toFixed(3)),
          splitNumber: 2, reason: 'Remainder fulfilled from DC', status: 'partial',
        })
        routed++
      } else {
        resultData.push({
          runId: run.id, orderId, orderLine: `Line-${i + 1}`, productName: product,
          qty, assignedTo: '', assignedType: '',
          routingScore: 0, splitNumber: 1,
          reason: 'No eligible location: inventory below threshold at all nodes',
          status: 'unroutable',
        })
        failed++
      }
    }

    await prisma.domResult.createMany({ data: resultData })

    const duration = Date.now() - startMs

    const completedRun = await prisma.domOrderRun.update({
      where: { id: run.id },
      data: { status: 'completed', ordersRouted: routed, ordersFailed: failed, duration },
      include: { results: true },
    })

    return NextResponse.json({ run: completedRun, profileName })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'DOM run failed' }, { status: 500 })
  }
}
