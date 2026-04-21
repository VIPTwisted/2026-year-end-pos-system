import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const schedules = await prisma.deferralSchedule.findMany({
      include: {
        template: { select: { id: true, name: true, deferralType: true, method: true } },
        lines: { orderBy: { periodDate: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(schedules)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch deferral schedules' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { templateId, entityType, entityId, entityRef, totalAmount, startDate, endDate } = body

    if (!templateId || !entityType || !entityId || !entityRef || !totalAmount || !startDate || !endDate) {
      return NextResponse.json({ error: 'templateId, entityType, entityId, entityRef, totalAmount, startDate, endDate are required' }, { status: 400 })
    }

    const template = await prisma.deferralTemplate.findUnique({ where: { id: templateId } })
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Generate period lines based on method
    const months = Math.max(1, template.periodsCount)
    const perPeriod = totalAmount / months
    const lines: { periodDate: Date; amount: number }[] = []

    for (let i = 0; i < months; i++) {
      const d = new Date(start)
      d.setMonth(d.getMonth() + i)
      lines.push({ periodDate: d, amount: Math.round(perPeriod * 100) / 100 })
    }

    // Adjust last line for rounding
    const lineSum = lines.reduce((s, l) => s + l.amount, 0)
    const diff = Math.round((totalAmount - lineSum) * 100) / 100
    if (lines.length > 0) lines[lines.length - 1].amount += diff

    const schedule = await prisma.deferralSchedule.create({
      data: {
        templateId,
        entityType,
        entityId,
        entityRef,
        totalAmount,
        deferredAmt: totalAmount,
        recognizedAmt: 0,
        status: 'active',
        startDate: start,
        endDate: end,
        lines: { create: lines },
      },
      include: {
        template: true,
        lines: { orderBy: { periodDate: 'asc' } },
      },
    })
    return NextResponse.json(schedule, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create deferral schedule' }, { status: 500 })
  }
}
