import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      activeForecastCount,
      pendingSuggestions,
      criticalSuggestions,
      unresolvedTriggers,
      safetyRulesActive,
      linesWithActuals,
    ] = await Promise.all([
      prisma.demandForecast.count({ where: { status: 'active' } }),
      prisma.replenishmentSuggestion.count({ where: { status: 'pending' } }),
      prisma.replenishmentSuggestion.count({ where: { status: 'pending', urgency: 'critical' } }),
      prisma.reorderTrigger.count({ where: { resolved: false } }),
      prisma.safetyStockRule.count({ where: { isActive: true } }),
      prisma.forecastLine.findMany({
        where: { actualQty: { not: null }, variance: { not: null } },
        select: { forecastedQty: true, actualQty: true, variance: true },
      }),
    ])

    let avgForecastAccuracy = 0
    if (linesWithActuals.length > 0) {
      const accuracies = linesWithActuals.map((l) => {
        if (!l.forecastedQty || l.forecastedQty === 0) return 0
        const pctError = Math.abs((l.variance ?? 0) / l.forecastedQty) * 100
        return Math.max(0, 100 - pctError)
      })
      avgForecastAccuracy = Math.round(
        accuracies.reduce((a, b) => a + b, 0) / accuracies.length
      )
    }

    return NextResponse.json({
      activeForecastCount,
      avgForecastAccuracy,
      pendingSuggestions,
      criticalSuggestions,
      unresolvedTriggers,
      safetyRulesActive,
    })
  } catch (error) {
    console.error('GET /api/forecasting/metrics error:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
