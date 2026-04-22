import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function getWeekKey(date: Date): string {
  const d = startOfWeek(date)
  return d.toISOString().split('T')[0]
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const forecastDateParam = searchParams.get('forecastDate')
  const forecastId = searchParams.get('forecastId')

  const today = forecastDateParam ? new Date(forecastDateParam) : new Date()
  today.setHours(0, 0, 0, 0)
  const horizonEnd = addDays(today, 91) // 13 weeks

  // Build 13 weekly buckets
  const weeks: Array<{
    weekStart: Date
    weekEnd: Date
    key: string
    label: string
    arInflows: number
    apOutflows: number
    salesOrderInflows: number
    poOutflows: number
    manualInflows: number
    manualOutflows: number
  }> = []

  for (let w = 0; w < 13; w++) {
    const ws = addDays(today, w * 7)
    const we = addDays(ws, 6)
    ws.setHours(0, 0, 0, 0)
    we.setHours(23, 59, 59, 999)
    const label = `Wk ${w + 1} (${ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
    weeks.push({
      weekStart: ws,
      weekEnd: we,
      key: getWeekKey(ws),
      label,
      arInflows: 0,
      apOutflows: 0,
      salesOrderInflows: 0,
      poOutflows: 0,
      manualInflows: 0,
      manualOutflows: 0,
    })
  }

  // Pull AR invoices (open/partial) due in horizon
  const arInvoices = await prisma.customerInvoice.findMany({
    where: {
      status: { in: ['posted', 'partial'] },
      dueDate: { gte: today, lte: horizonEnd },
    },
    select: { dueDate: true, totalAmount: true, paidAmount: true },
  })

  for (const inv of arInvoices) {
    const remaining = inv.totalAmount - inv.paidAmount
    const wk = weeks.find(w => inv.dueDate >= w.weekStart && inv.dueDate <= w.weekEnd)
    if (wk) wk.arInflows += remaining
  }

  // Pull AP invoices (open/partial) due in horizon
  const apInvoices = await prisma.vendorInvoice.findMany({
    where: {
      status: { in: ['posted', 'partial'] },
      dueDate: { gte: today, lte: horizonEnd },
    },
    select: { dueDate: true, totalAmount: true, paidAmount: true },
  })

  for (const inv of apInvoices) {
    const remaining = inv.totalAmount - inv.paidAmount
    const wk = weeks.find(w => inv.dueDate >= w.weekStart && inv.dueDate <= w.weekEnd)
    if (wk) wk.apOutflows += remaining
  }

  // Pull open orders (expected inflows) by createdAt + 14 days as rough expected date
  const openOrders = await prisma.order.findMany({
    where: { status: { in: ['pending', 'processing'] } },
    select: { createdAt: true, totalAmount: true },
  })

  for (const ord of openOrders) {
    const expectedDate = addDays(ord.createdAt, 14)
    if (expectedDate >= today && expectedDate <= horizonEnd) {
      const wk = weeks.find(w => expectedDate >= w.weekStart && expectedDate <= w.weekEnd)
      if (wk) wk.salesOrderInflows += ord.totalAmount
    }
  }

  // Pull open POs (expected outflows) by expectedDate
  const openPOs = await prisma.purchaseOrder.findMany({
    where: {
      status: { in: ['draft', 'sent', 'acknowledged', 'partial'] },
      expectedDate: { gte: today, lte: horizonEnd },
    },
    select: { expectedDate: true, totalAmount: true },
  })

  for (const po of openPOs) {
    if (!po.expectedDate) continue
    const wk = weeks.find(w => po.expectedDate! >= w.weekStart && po.expectedDate! <= w.weekEnd)
    if (wk) wk.poOutflows += po.totalAmount
  }

  // Pull manual lines (from specific forecast or all recent)
  let manualLines: Array<{ amount: number; expectedDate: Date; category: string; description: string }> = []
  if (forecastId) {
    manualLines = await prisma.cashFlowManualLine.findMany({
      where: {
        forecastId,
        expectedDate: { gte: today, lte: horizonEnd },
      },
    })
  }

  for (const line of manualLines) {
    const wk = weeks.find(w => line.expectedDate >= w.weekStart && line.expectedDate <= w.weekEnd)
    if (wk) {
      if (line.amount >= 0) wk.manualInflows += line.amount
      else wk.manualOutflows += Math.abs(line.amount)
    }
  }

  // Build response with running balance
  let runningBalance = 0
  const buckets = weeks.map(wk => {
    const net = (wk.arInflows + wk.salesOrderInflows + wk.manualInflows) -
                (wk.apOutflows + wk.poOutflows + wk.manualOutflows)
    runningBalance += net
    return {
      key: wk.key,
      label: wk.label,
      weekStart: wk.weekStart.toISOString(),
      weekEnd: wk.weekEnd.toISOString(),
      arInflows: Math.round(wk.arInflows * 100) / 100,
      apOutflows: Math.round(wk.apOutflows * 100) / 100,
      salesOrderInflows: Math.round(wk.salesOrderInflows * 100) / 100,
      poOutflows: Math.round(wk.poOutflows * 100) / 100,
      manualInflows: Math.round(wk.manualInflows * 100) / 100,
      manualOutflows: Math.round(wk.manualOutflows * 100) / 100,
      totalInflows: Math.round((wk.arInflows + wk.salesOrderInflows + wk.manualInflows) * 100) / 100,
      totalOutflows: Math.round((wk.apOutflows + wk.poOutflows + wk.manualOutflows) * 100) / 100,
      net: Math.round(net * 100) / 100,
      runningBalance: Math.round(runningBalance * 100) / 100,
    }
  })

  const totalInflows = buckets.reduce((s, b) => s + b.totalInflows, 0)
  const totalOutflows = buckets.reduce((s, b) => s + b.totalOutflows, 0)

  return NextResponse.json({
    forecastDate: today.toISOString(),
    horizonEnd: horizonEnd.toISOString(),
    totalInflows: Math.round(totalInflows * 100) / 100,
    totalOutflows: Math.round(totalOutflows * 100) / 100,
    projectedNet: Math.round((totalInflows - totalOutflows) * 100) / 100,
    buckets,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, forecastDate, includeAR, includeAP, includeSalesOrders, includePOs, includePayroll, manualLines } = body

  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const forecast = await prisma.cashFlowForecast.create({
    data: {
      name,
      description: description || null,
      forecastDate: forecastDate ? new Date(forecastDate) : new Date(),
      includeAR: includeAR ?? true,
      includeAP: includeAP ?? true,
      includeSalesOrders: includeSalesOrders ?? true,
      includePOs: includePOs ?? true,
      includePayroll: includePayroll ?? false,
      manualLines: manualLines && Array.isArray(manualLines) ? {
        create: (manualLines as Array<{ description: string; amount: number; expectedDate: string; category?: string; notes?: string }>).map(l => ({
          description: l.description,
          amount: Number(l.amount),
          expectedDate: new Date(l.expectedDate),
          category: l.category || 'other',
          notes: l.notes || null,
        })),
      } : undefined,
    },
    include: { manualLines: true },
  })

  return NextResponse.json(forecast, { status: 201 })
}
