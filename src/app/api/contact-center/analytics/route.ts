import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function formatSeconds(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date()

  const where = { startedAt: { gte: from, lte: to } }

  const [
    allConvs,
    channelData,
    sentimentData,
    csatAgg,
    agentData,
  ] = await Promise.all([
    prisma.conversation.findMany({
      where,
      select: {
        id: true,
        status: true,
        waitTimeSeconds: true,
        handleTimeSeconds: true,
        csat: true,
        sentiment: true,
        agentName: true,
        startedAt: true,
        wrapUpCode: true,
      },
    }),
    prisma.conversation.groupBy({
      by: ['channelId'],
      where,
      _count: { id: true },
    }),
    prisma.conversation.groupBy({
      by: ['sentiment'],
      where,
      _count: { id: true },
    }),
    prisma.conversation.aggregate({
      where: { ...where, csat: { not: null } },
      _avg: { csat: true, handleTimeSeconds: true, waitTimeSeconds: true },
    }),
    prisma.conversation.groupBy({
      by: ['agentName'],
      where: { ...where, agentName: { not: null } },
      _count: { id: true },
      _avg: { handleTimeSeconds: true, csat: true },
    }),
  ])

  const total = allConvs.length
  const abandoned = allConvs.filter(c => c.status === 'abandoned').length
  const abandonmentRate = total > 0 ? Math.round((abandoned / total) * 100) : 0

  // Hourly distribution (0-23)
  const hourly: number[] = Array(24).fill(0)
  allConvs.forEach(c => {
    const h = new Date(c.startedAt).getHours()
    hourly[h]++
  })

  // Daily trend last 14 days
  const daily: Record<string, number> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    daily[d.toISOString().slice(0, 10)] = 0
  }
  allConvs.forEach(c => {
    const day = new Date(c.startedAt).toISOString().slice(0, 10)
    if (day in daily) daily[day]++
  })

  // Channel breakdown with names
  const channels = await prisma.contactChannel.findMany({ select: { id: true, name: true, type: true } })
  const channelMap = Object.fromEntries(channels.map(c => [c.id, c]))
  const channelBreakdown = channelData.map(cd => ({
    channelId: cd.channelId,
    channelName: channelMap[cd.channelId]?.name ?? 'Unknown',
    channelType: channelMap[cd.channelId]?.type ?? 'unknown',
    count: cd._count.id,
  }))

  // Sentiment breakdown
  const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 }
  sentimentData.forEach(s => {
    const key = (s.sentiment ?? 'neutral') as keyof typeof sentimentBreakdown
    if (key in sentimentBreakdown) sentimentBreakdown[key] = s._count.id
  })

  // Wrap-up code frequency
  const wrapUpFreq: Record<string, number> = {}
  allConvs.forEach(c => {
    if (c.wrapUpCode) wrapUpFreq[c.wrapUpCode] = (wrapUpFreq[c.wrapUpCode] ?? 0) + 1
  })
  const topWrapUp = Object.entries(wrapUpFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([code, count]) => ({ code, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))

  // Agent performance
  const agentPerf = agentData.map(a => ({
    agentName: a.agentName,
    conversations: a._count.id,
    avgHandleTime: a._avg.handleTimeSeconds ?? 0,
    avgHandleTimeFormatted: formatSeconds(Math.round(a._avg.handleTimeSeconds ?? 0)),
    csatAvg: a._avg.csat ? Math.round(a._avg.csat * 10) / 10 : null,
  }))

  return NextResponse.json({
    total,
    abandoned,
    abandonmentRate,
    csatAvg: csatAgg._avg.csat ? Math.round(csatAgg._avg.csat * 10) / 10 : null,
    avgWaitSeconds: Math.round(csatAgg._avg.waitTimeSeconds ?? 0),
    avgHandleSeconds: Math.round(csatAgg._avg.handleTimeSeconds ?? 0),
    avgHandleFormatted: formatSeconds(Math.round(csatAgg._avg.handleTimeSeconds ?? 0)),
    channelBreakdown,
    sentimentBreakdown,
    hourlyDistribution: hourly,
    dailyTrend: Object.entries(daily).map(([date, count]) => ({ date, count })),
    agentPerformance: agentPerf,
    topWrapUpCodes: topWrapUp,
  })
}
