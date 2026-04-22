import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const startDate = sp.get('startDate')
    const endDate = sp.get('endDate')
    const storeId = sp.get('storeId')
    const registerId = sp.get('registerId')
    const cashierId = sp.get('cashierId')
    const status = sp.get('status') ?? 'all'
    const varianceOnly = sp.get('varianceOnly') === 'true'

    const where: Record<string, unknown> = {}

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        dateFilter.lte = end
      }
      where.openTime = dateFilter
    }

    if (storeId) where.storeId = storeId
    if (registerId) where.registerId = registerId
    if (cashierId) where.userId = cashierId
    if (status !== 'all') where.status = status
    if (varianceOnly) {
      where.variance = { not: null }
      where.OR = [
        { variance: { gt: 0.01 } },
        { variance: { lt: -0.01 } },
      ]
    }

    const shifts = await prisma.posShift.findMany({
      where,
      include: {
        store: { select: { name: true } },
      },
      orderBy: { openTime: 'desc' },
    })

    const totalShifts = shifts.length
    let totalSales = 0
    let totalCash = 0
    let totalVariance = 0
    let shiftsWithVariance = 0

    for (const s of shifts) {
      totalSales += s.totalSales
      totalCash += s.totalCash
      if (s.variance != null && Math.abs(s.variance) > 0.01) {
        totalVariance += s.variance
        shiftsWithVariance++
      }
    }

    const avgShiftSales = totalShifts > 0 ? totalSales / totalShifts : 0

    const shapedShifts = shifts.map(s => ({
      id: s.id,
      storeName: s.store.name,
      cashierName: s.cashierName,
      registerId: s.registerId,
      openFloat: s.openFloat,
      closeFloat: s.closeFloat,
      cashSales: s.cashSales,
      voidAmount: s.voidAmount,
      totalSales: s.totalSales,
      totalCash: s.totalCash,
      expectedCash: s.expectedCash,
      variance: s.variance,
      varianceAlerted: s.varianceAlerted,
      openTime: s.openTime,
      closeTime: s.closeTime,
      status: s.status,
      openDenominations: s.openDenominations,
      closeDenominations: s.closeDenominations,
      notes: s.notes,
    }))

    return NextResponse.json({
      shifts: shapedShifts,
      summary: {
        totalShifts,
        totalSales,
        totalCash,
        totalVariance,
        shiftsWithVariance,
        avgShiftSales,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
