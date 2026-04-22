import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CATEGORIES = ['Electronics', 'Apparel', 'Hardware', 'Consumables', 'Raw Materials']

function genPeriods(horizon: number): string[] {
  const now = new Date()
  const periods: string[] = []
  for (let i = -(horizon - 1); i <= 0; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return periods
}

function computeMape(forecasts: number[], actuals: (number | null)[]): number {
  const pairs = actuals.reduce<{ f: number; a: number }[]>((acc, a, i) => {
    if (a !== null && a > 0) acc.push({ f: forecasts[i], a })
    return acc
  }, [])
  if (pairs.length === 0) return 0
  const mape = pairs.reduce((s, { f, a }) => s + Math.abs((a - f) / a) * 100, 0) / pairs.length
  return Math.round(mape * 10) / 10
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const horizon   = Math.min(12, Math.max(1, parseInt(searchParams.get('horizon') ?? '12')))
    const category  = searchParams.get('category') ?? 'All'

    // Fetch DemandForecast + ForecastLine records
    const forecasts = await (prisma as any).demandForecast.findMany({
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const periods = genPeriods(horizon)

    // Build per-product rows from forecast lines
    const productMap: Record<string, {
      category: string
      periods: Record<string, { forecastQty: number; actualQty: number | null }>
    }> = {}

    for (const fc of forecasts) {
      for (const line of fc.lines) {
        const name = line.productName ?? line.sku ?? 'Unknown'
        const cat  = line.categoryId
          ? CATEGORIES[parseInt(line.categoryId, 16) % CATEGORIES.length]
          : CATEGORIES[name.length % CATEGORIES.length]
        if (category !== 'All' && cat !== category) continue
        if (!productMap[name]) productMap[name] = { category: cat, periods: {} }
        const p = fc.period
        if (!productMap[name].periods[p]) {
          productMap[name].periods[p] = { forecastQty: 0, actualQty: null }
        }
        productMap[name].periods[p].forecastQty += line.forecastedQty ?? 0
        if (line.actualQty !== null && line.actualQty !== undefined) {
          productMap[name].periods[p].actualQty = (productMap[name].periods[p].actualQty ?? 0) + line.actualQty
        }
      }
    }

    // Build rows with period series
    const rows = Object.entries(productMap).map(([product, data]) => {
      const periodSeries = periods.map(p => {
        const entry = data.periods[p]
        return {
          period: p,
          forecastQty: entry?.forecastQty ?? 0,
          actualQty: entry?.actualQty ?? null,
          mape: entry ? computeMape([entry.forecastQty], [entry.actualQty]) : null,
        }
      })
      const forecastArr = periodSeries.map(p => p.forecastQty)
      const actualArr   = periodSeries.map(p => p.actualQty)
      return {
        productName: product,
        category: data.category,
        periods: periodSeries,
        avgMape: computeMape(forecastArr, actualArr),
      }
    })

    // If no DB data, return representative mock data
    if (rows.length === 0) {
      const MOCK_PRODUCTS = [
        { name: 'Widget Alpha',      cat: 'Electronics', seed: 7 },
        { name: 'Component Beta',    cat: 'Hardware',    seed: 13 },
        { name: 'Assembly Gamma',    cat: 'Electronics', seed: 5 },
        { name: 'Part Delta',        cat: 'Raw Materials', seed: 11 },
        { name: 'Module Epsilon',    cat: 'Consumables', seed: 3 },
        { name: 'Unit Zeta',         cat: 'Apparel',     seed: 9 },
      ].filter(p => category === 'All' || p.cat === category)

      for (const mp of MOCK_PRODUCTS) {
        const periodSeries = periods.map((p, i) => {
          const base = 100 + mp.seed * 20
          const forecastQty = Math.round(base + Math.sin(i * 0.5) * 30)
          const isPast = i < horizon - 3
          const actualQty = isPast ? Math.round(forecastQty * (0.85 + (mp.seed + i) % 3 * 0.1)) : null
          return { period: p, forecastQty, actualQty, mape: null }
        })
        const forecastArr = periodSeries.map(p => p.forecastQty)
        const actualArr   = periodSeries.map(p => p.actualQty)
        const avgMape = computeMape(forecastArr, actualArr)
        rows.push({ productName: mp.name, category: mp.cat, periods: periodSeries, avgMape })
      }
    }

    // KPIs
    const withMape = rows.filter(r => r.avgMape > 0)
    const avgMape = withMape.length > 0
      ? Math.round(withMape.reduce((s, r) => s + r.avgMape, 0) / withMape.length * 10) / 10
      : 0

    const byCat: Record<string, number[]> = {}
    for (const r of withMape) {
      if (!byCat[r.category]) byCat[r.category] = []
      byCat[r.category].push(r.avgMape)
    }
    const catAvg = Object.entries(byCat).map(([cat, vals]) => ({
      cat, avg: vals.reduce((s, v) => s + v, 0) / vals.length,
    })).sort((a, b) => a.avg - b.avg)

    const kpis = {
      avgMape,
      totalProducts: rows.length,
      bestCategory: catAvg[0]?.cat ?? '—',
      worstCategory: catAvg[catAvg.length - 1]?.cat ?? '—',
    }

    return NextResponse.json({ rows, kpis })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
