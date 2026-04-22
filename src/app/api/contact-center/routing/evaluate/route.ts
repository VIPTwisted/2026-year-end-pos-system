import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { channelType, customerId, keywords, customerTier } = body

  const rules = await prisma.routingRule.findMany({
    where: {
      isActive: true,
      channelType: { in: [channelType, 'any'] },
    },
    orderBy: { priority: 'desc' },
  })

  const matched = rules.filter(rule => {
    const cond = rule.conditions as unknown as Record<string, string>
    if (cond.customerTier && customerTier && cond.customerTier !== customerTier) return false
    if (cond.keyword && keywords) {
      const kw = keywords as string
      if (!kw.toLowerCase().includes(cond.keyword.toLowerCase())) return false
    }
    return true
  })

  return NextResponse.json({ matched, total: rules.length })
}
