import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/finance/currency-revaluation
 * Returns FX exposure by active non-base currency with exchange rate history and unrealized G/L.
 * Exposure is derived from open AR/AP linked to vendors/customers whose currency is not USD.
 */
export async function GET() {
  try {
    const currencies = await prisma.currency.findMany({
      where: { isActive: true, isBase: false },
      include: {
        exchangeRates: {
          orderBy: { rateDate: 'desc' },
          take: 2,
        },
      },
    })

    // Get open AP grouped by vendor currency (vendors have a currency field)
    const openAPByVendorCurrency = await prisma.vendorInvoice.findMany({
      where: { status: { notIn: ['paid', 'cancelled', 'voided'] } },
      select: { totalAmount: true, vendor: { select: { currency: true } } },
    })

    // AR does not carry a per-invoice currency — use vendor-side AP only for now
    const arMap: Record<string, number> = {}

    const apMap: Record<string, number> = {}
    for (const inv of openAPByVendorCurrency) {
      const ccy = (inv.vendor as { currency?: string } | null)?.currency ?? 'USD'
      if (ccy && ccy !== 'USD') {
        apMap[ccy] = (apMap[ccy] ?? 0) + inv.totalAmount
      }
    }

    const exposures = currencies.map(c => {
      const currentRate = c.exchangeRates[0]?.rate ?? 0
      const previousRate = c.exchangeRates[1]?.rate ?? 0
      const receivableBalance = arMap[c.code] ?? 0
      const payableBalance = apMap[c.code] ?? 0

      // Unrealized G/L = revalue at current rate vs prior rate
      // Net exposure in foreign currency units
      const netForeign = receivableBalance - payableBalance
      const exposureAtPrior = previousRate > 0 ? netForeign / previousRate : 0
      const exposureAtCurrent = currentRate > 0 ? netForeign / currentRate : 0
      // Change in USD value (positive = gain, negative = loss)
      const unrealizedGainLoss = previousRate > 0 && currentRate > 0
        ? (1 / currentRate - 1 / previousRate) * netForeign
        : 0

      return {
        currencyCode: c.code,
        currencyName: c.name,
        currentRate,
        previousRate,
        rateDate: c.exchangeRates[0]?.rateDate?.toISOString() ?? null,
        exposure: netForeign,
        exposureBase: exposureAtPrior,
        revaluedBase: exposureAtCurrent,
        unrealizedGainLoss,
        payableBalance,
        receivableBalance,
      }
    })

    const totalUnrealizedGain = exposures.filter(e => e.unrealizedGainLoss > 0).reduce((s, e) => s + e.unrealizedGainLoss, 0)
    const totalUnrealizedLoss = Math.abs(exposures.filter(e => e.unrealizedGainLoss < 0).reduce((s, e) => s + e.unrealizedGainLoss, 0))
    const netGainLoss = exposures.reduce((s, e) => s + e.unrealizedGainLoss, 0)

    // Recent revaluation runs stored as AuditEvents
    const recentRunEvents = await prisma.auditEvent.findMany({
      where: { eventType: 'fx_revaluation' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    const recentRuns = recentRunEvents.map(e => {
      let parsed: Record<string, unknown> = {}
      try { parsed = JSON.parse(e.afterValue ?? '{}') } catch { /* noop */ }
      return {
        id: e.id,
        runDate: e.createdAt.toISOString(),
        status: (parsed.status as string) ?? 'posted',
        totalGainLoss: (parsed.totalGainLoss as number) ?? 0,
        currenciesProcessed: (parsed.currenciesProcessed as number) ?? 0,
        postedBy: e.userName ?? null,
        notes: e.description ?? null,
      }
    })

    const lastRunDate = recentRunEvents[0]?.createdAt?.toISOString() ?? null

    return NextResponse.json({
      exposures,
      totalUnrealizedGain,
      totalUnrealizedLoss,
      netGainLoss,
      lastRunDate,
      recentRuns,
    })
  } catch (err) {
    console.error('[currency-revaluation GET]', err)
    return NextResponse.json({ error: 'Failed to load FX exposure' }, { status: 500 })
  }
}

/**
 * POST /api/finance/currency-revaluation
 * Runs revaluation: logs an AuditEvent recording the net G/L impact.
 */
export async function POST(req: NextRequest) {
  try {
    const { action, notes } = await req.json()
    if (action !== 'revalue') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const currencies = await prisma.currency.findMany({
      where: { isActive: true, isBase: false },
      include: { exchangeRates: { orderBy: { rateDate: 'desc' }, take: 2 } },
    })

    const openAPByVendorCurrency = await prisma.vendorInvoice.findMany({
      where: { status: { notIn: ['paid', 'cancelled', 'voided'] } },
      select: { totalAmount: true, vendor: { select: { currency: true } } },
    })

    const arMap: Record<string, number> = {}
    const apMap: Record<string, number> = {}
    for (const inv of openAPByVendorCurrency) {
      const ccy = (inv.vendor as { currency?: string } | null)?.currency ?? 'USD'
      if (ccy !== 'USD') apMap[ccy] = (apMap[ccy] ?? 0) + inv.totalAmount
    }

    let netGainLoss = 0
    let currenciesProcessed = 0
    for (const c of currencies) {
      const currentRate = c.exchangeRates[0]?.rate ?? 0
      const previousRate = c.exchangeRates[1]?.rate ?? 0
      if (currentRate === 0 || previousRate === 0) continue
      const netForeign = (arMap[c.code] ?? 0) - (apMap[c.code] ?? 0)
      netGainLoss += (1 / currentRate - 1 / previousRate) * netForeign
      currenciesProcessed++
    }

    const auditEntry = await prisma.auditEvent.create({
      data: {
        eventType: 'fx_revaluation',
        description: notes || `FX revaluation — net G/L: ${netGainLoss >= 0 ? '+' : ''}${netGainLoss.toFixed(2)}`,
        afterValue: JSON.stringify({ status: 'posted', totalGainLoss: netGainLoss, currenciesProcessed }),
        riskLevel: 'low',
      },
    })

    return NextResponse.json({
      id: auditEntry.id,
      runDate: auditEntry.createdAt,
      status: 'posted',
      netGainLoss,
      currenciesProcessed,
    }, { status: 201 })
  } catch (err) {
    console.error('[currency-revaluation POST]', err)
    return NextResponse.json({ error: 'Revaluation failed' }, { status: 500 })
  }
}
