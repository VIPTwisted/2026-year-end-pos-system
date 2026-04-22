import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status')
  const type     = searchParams.get('type')
  const assetId  = searchParams.get('assetId')

  try {
    const workOrders = await prisma.maintenanceWorkOrder.findMany({
      where: {
        ...(status  ? { status } : {}),
        ...(type    ? { workOrderType: type } : {}),
        ...(assetId ? { assetId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return NextResponse.json(workOrders)
  } catch {
    return NextResponse.json({ error: 'Work orders unavailable' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { assetId, description, workOrderType, priority, assignedTo, startDate, endDate, estimatedHours, notes } = body

    if (!assetId || !description) {
      return NextResponse.json({ error: 'assetId and description are required' }, { status: 400 })
    }

    const last = await prisma.maintenanceWorkOrder.findFirst({ orderBy: { createdAt: 'desc' } })
    let seq = 1
    if (last) {
      const parts = last.workOrderNumber.split('-')
      const n = parseInt(parts[1] ?? '0', 10)
      if (!isNaN(n)) seq = n + 1
    }
    const workOrderNumber = `WO-${String(seq).padStart(6, '0')}`

    const wo = await prisma.maintenanceWorkOrder.create({
      data: {
        workOrderNumber,
        assetId,
        description,
        workOrderType: workOrderType ?? 'Corrective',
        priority: priority ?? 'Normal',
        assignedTo: assignedTo ?? null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        notes: notes ?? null,
        status: 'Open',
      },
    })
    return NextResponse.json(wo, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create work order' }, { status: 500 })
  }
}
