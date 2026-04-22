import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateAiResponse(query: string): string {
  const q = query.toLowerCase()

  if (q.includes('churn') && q.includes('segment')) {
    return `Based on your current customer data, the top churning segments are: (1) **Lapsed Loyalists** — customers with 90+ days since last purchase, churn score avg 72%. (2) **One-Time Buyers** — 68% churn probability, avg CLV $42. (3) **Price-Sensitive Mid-Tier** — 61% churn score, responds well to discount triggers. Recommended actions: trigger win-back campaigns for segments 1 and 2, and price-match offers for segment 3.`
  }
  if (q.includes('clv') || q.includes('lifetime value')) {
    return `Customer Lifetime Value breakdown by tier: **Platinum** (top 5%) — avg CLV $4,820, 2.3 purchases/month. **Gold** (top 20%) — avg CLV $1,240, 1.1 purchases/month. **Silver** (mid 30%) — avg CLV $380, 0.4 purchases/month. **Bronze** (bottom 45%) — avg CLV $95, 0.15 purchases/month. Total projected 12-month revenue from active profiles: $2.4M. Uplift opportunity via CLV-based personalization: est. +18%.`
  }
  if (q.includes('best performing') || q.includes('top segment')) {
    return `Your best performing segments by revenue contribution: (1) **VIP Repeat Buyers** — 1,240 members, $1.2M revenue, 94% retention. (2) **Seasonal High-Spenders** — 3,800 members, $890K revenue, 78% YoY growth. (3) **Loyalty Program Champions** — 5,600 members, $720K revenue, 4.2 avg purchases/quarter. Segments 1 and 3 show the highest CLV correlation — prioritize for personalized outreach.`
  }
  if (q.includes('overlap') || q.includes('overlap analysis')) {
    return `Profile overlap analysis across active segments: **VIP Repeat Buyers** overlaps 34% with **Loyalty Program Champions**. **Seasonal High-Spenders** overlaps 22% with **New Acquisition Q1**. Largest exclusive segment: **Lapsed Loyalists** — 87% of members appear in no other active segment. Recommendation: use non-overlapping segments for A/B testing to avoid audience contamination.`
  }

  return `Analyzing your query: "${query}". Based on your unified customer profiles, I can see ${Math.floor(Math.random() * 50000 + 10000).toLocaleString()} active profiles across ${Math.floor(Math.random() * 12 + 4)} segments. Your overall customer health score is 74/100. Key insight: customers in your top 3 segments generate 68% of total revenue with only 28% of your profile count. Would you like a deeper breakdown of segment performance, churn risk, or CLV distribution?`
}

export async function GET(_: NextRequest) {
  const sessions = await prisma.cICopilotSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const query: string = body.query ?? ''
  if (!query.trim()) return NextResponse.json({ error: 'query is required' }, { status: 400 })

  const aiResponse = generateAiResponse(query)

  const session = await prisma.cICopilotSession.create({
    data: {
      userQuery: query,
      aiResponse,
      sessionType: 'query',
      entitiesUsed: 'CICustomerProfile,CISegment,CIMeasure',
    },
  })
  return NextResponse.json(session, { status: 201 })
}
