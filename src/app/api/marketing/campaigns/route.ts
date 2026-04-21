import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      contacts: { include: { customer: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(campaigns)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, type, subject, content, budget, startDate, endDate } = body

  if (!name || !type) {
    return NextResponse.json({ error: 'name and type are required' }, { status: 400 })
  }

  const campaign = await prisma.campaign.create({
    data: {
      name,
      type,
      subject: subject ?? null,
      content: content ?? null,
      budget: budget ? parseFloat(budget) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: 'draft',
    },
  })

  return NextResponse.json(campaign, { status: 201 })
}
