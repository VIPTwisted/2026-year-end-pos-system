import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function hourLabel(h: number): string {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

interface HourBucket {
  hour: number
  label: string
  orders: number
  revenue: number
  avgOrder: number
}

interface DayBucket {
  day: number
  label: string
  orders: number
  revenue: number
  avgOrder: number
}

interface WeekOfMonthBucket {
  week: number
  label: string
  orders: number
  revenue: number
  avgOrder: number
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const fromParam = sp.get('from')
    const toParam = sp.get('to')

    const now = new Date()
    const defaultFrom = new Date(now)
    defaultFrom.setDate(defaultFrom.getDate() - 30)

    const from = fromParam ? new Date(fromParam + 'T00:00:00') : defaultFrom
    const to = toParam ? new Date(toParam + 'T23:59:59') : now

    // Fetch all completed orders in range — all calcs done in JS
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        status: 'completed',
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    })

    // Initialize hour buckets 0–23
    const hourMap = new Map<number, { orders: number; revenue: number }>()
    for (let h = 0; h < 24; h++) {
      hourMap.set(h, { orders: 0, revenue: 0 })
    }

    // Initialize day buckets 0–6 (Sun–Sat)
    const dayMap = new Map<number, { orders: number; revenue: number }>()
    for (let d = 0; d < 7; d++) {
      dayMap.set(d, { orders: 0, revenue: 0 })
    }

    // Initialize week-of-month buckets 1–5
    const weekMap = new Map<number, { orders: number; revenue: number }>()
    for (let w = 1; w <= 5; w++) {
      weekMap.set(w, { orders: 0, revenue: 0 })
    }

    for (const order of orders) {
      const d = new Date(order.createdAt)
      const h = d.getHours()
      const dow = d.getDay()
      const weekOfMonth = Math.ceil(d.getDate() / 7)
      const rev = order.totalAmount ?? 0

      const hb = hourMap.get(h)!
      hb.orders += 1
      hb.revenue += rev

      const db = dayMap.get(dow)!
      db.orders += 1
      db.revenue += rev

      const wb = weekMap.get(weekOfMonth)!
      wb.orders += 1
      wb.revenue += rev
    }

    const byHour: HourBucket[] = Array.from(hourMap.entries()).map(([hour, b]) => ({
      hour,
      label: hourLabel(hour),
      orders: b.orders,
      revenue: Math.round(b.revenue * 100) / 100,
      avgOrder: b.orders > 0 ? Math.round((b.revenue / b.orders) * 100) / 100 : 0,
    }))

    const byDayOfWeek: DayBucket[] = Array.from(dayMap.entries()).map(([day, b]) => ({
      day,
      label: DAY_LABELS[day],
      orders: b.orders,
      revenue: Math.round(b.revenue * 100) / 100,
      avgOrder: b.orders > 0 ? Math.round((b.revenue / b.orders) * 100) / 100 : 0,
    }))

    const byWeekOfMonth: WeekOfMonthBucket[] = Array.from(weekMap.entries()).map(([week, b]) => ({
      week,
      label: `Week ${week}`,
      orders: b.orders,
      revenue: Math.round(b.revenue * 100) / 100,
      avgOrder: b.orders > 0 ? Math.round((b.revenue / b.orders) * 100) / 100 : 0,
    }))

    // Derive peak / slowest — only consider hours/days with data
    const activeHours = byHour.filter(h => h.orders > 0)
    const activeDays = byDayOfWeek.filter(d => d.orders > 0)

    const peakHourObj = activeHours.reduce<HourBucket | null>(
      (best, cur) => (best === null || cur.revenue > best.revenue ? cur : best),
      null,
    )
    const slowestHourObj = activeHours.reduce<HourBucket | null>(
      (worst, cur) => (worst === null || cur.revenue < worst.revenue ? cur : worst),
      null,
    )
    const peakDayObj = activeDays.reduce<DayBucket | null>(
      (best, cur) => (best === null || cur.revenue > best.revenue ? cur : best),
      null,
    )
    const slowestDayObj = activeDays.reduce<DayBucket | null>(
      (worst, cur) => (worst === null || cur.revenue < worst.revenue ? cur : worst),
      null,
    )

    return NextResponse.json({
      byHour,
      byDayOfWeek,
      byWeekOfMonth,
      peakHour: peakHourObj?.label ?? '—',
      peakDay: peakDayObj?.label ?? '—',
      slowestHour: slowestHourObj?.label ?? '—',
      slowestDay: slowestDayObj?.label ?? '—',
      totalOrders: orders.length,
      periodFrom: from.toISOString(),
      periodTo: to.toISOString(),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
