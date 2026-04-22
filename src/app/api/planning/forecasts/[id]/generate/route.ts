import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generatePeriodLabels(start: Date, count: number, periodType: string): string[] {
  const labels: string[] = []
  const d = new Date(start)
  for (let i = 0; i < count; i++) {
    if (periodType === 'monthly') {
      labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
      d.setMonth(d.getMonth() + 1)
    } else if (periodType === 'weekly') {
      const week = Math.ceil(d.getDate() / 7)
      labels.push(`${d.getFullYear()}-W${String(week + i * 1).padStart(2, '0')}`)
      d.setDate(d.getDate() + 7)
    } else {
      const q = Math.floor(d.getMonth() / 3) + 1
      labels.push(`${d.getFullYear()}-Q${q}`)
      d.setMonth(d.getMonth() + 3)
    }
  }
  return labels
}

function movingAverage(actuals: number[], window = 3): number {
  if (actuals.length === 0) return 50 + Math.random() * 100
  const slice = actuals.slice(-window)
  return slice.reduce((a, b) => a + b, 0) / slice.length
}

function exponentialSmoothing(actuals: number[], alpha: number): number {
  if (actuals.length === 0) return 50 + Math.random() * 100
  let s = actuals[0]
  for (let i = 1; i < actuals.length; i++) {
    s = alpha * actuals[i] + (1 - alpha) * s
  }
  return s
}

function linearTrend(actuals: number[]): number {
  if (actuals.length < 2) return movingAverage(actuals)
  const n = actuals.length
  const xMean = (n - 1) / 2
  const yMean = actuals.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (actuals[i] - yMean)
    den += (i - xMean) ** 2
  }
  const slope = den === 0 ? 0 : num / den
  return yMean + slope * n
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const model = await (prisma as any).forecastModel.findUnique({
      where: { id },
      include: { entries: { orderBy: { period: 'asc' } } },
    })
    if (!model) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await (prisma as any).forecastEntry.deleteMany({
      where: { modelId: id, actualQty: null },
    })

    const actuals: number[] = (model.entries as any[])
      .filter((e: any) => e.actualQty != null)
      .map((e: any) => Number(e.actualQty))

    if (actuals.length === 0) {
      const mockBase = 80 + Math.random() * 120
      for (let i = 0; i < 6; i++) actuals.push(mockBase + (Math.random() - 0.5) * 40)
    }

    const periods = generatePeriodLabels(new Date(), model.horizon, model.periodType)
    const entries: any[] = []

    for (let i = 0; i < periods.length; i++) {
      const allActuals = [...actuals]
      let forecastQty: number

      switch (model.modelType) {
        case 'exponential-smoothing':
          forecastQty = exponentialSmoothing(allActuals, model.smoothingAlpha)
          break
        case 'linear-trend':
          forecastQty = linearTrend(allActuals)
          break
        case 'seasonal':
          forecastQty = movingAverage(allActuals, model.seasonalPeriods || 12)
          break
        default:
          forecastQty = movingAverage(allActuals, 3)
      }

      forecastQty = Math.max(0, forecastQty + (Math.random() - 0.5) * forecastQty * 0.1)
      allActuals.push(forecastQty)

      const confidence = Math.max(0.5, 0.95 - i * 0.025)
      entries.push({
        modelId: id,
        period: periods[i],
        forecastQty: Math.round(forecastQty * 10) / 10,
        actualQty: null,
        variance: null,
        confidence: Math.round(confidence * 100) / 100,
      })
    }

    await (prisma as any).forecastEntry.createMany({ data: entries })

    const created = await (prisma as any).forecastEntry.findMany({
      where: { modelId: id },
      orderBy: { period: 'asc' },
    })

    return NextResponse.json({ generated: entries.length, entries: created })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
