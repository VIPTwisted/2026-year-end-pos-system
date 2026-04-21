import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const templates = await prisma.deferralTemplate.findMany({
      include: { _count: { select: { schedules: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(templates)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch deferral templates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, deferralType, method, periodsCount, startDate, glAccountId, deferralAccountId, isActive } = body

    if (!name || !deferralType || !method) {
      return NextResponse.json({ error: 'name, deferralType, and method are required' }, { status: 400 })
    }

    const template = await prisma.deferralTemplate.create({
      data: {
        name,
        deferralType,
        method,
        periodsCount: periodsCount ?? 12,
        startDate: startDate ? new Date(startDate) : null,
        glAccountId: glAccountId ?? null,
        deferralAccountId: deferralAccountId ?? null,
        isActive: isActive ?? true,
      },
    })
    return NextResponse.json(template, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create deferral template' }, { status: 500 })
  }
}
