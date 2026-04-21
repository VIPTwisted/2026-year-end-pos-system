import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const schedule = await prisma.deferralSchedule.findUnique({
      where: { id },
      include: {
        template: true,
        lines: { orderBy: { periodDate: 'asc' } },
      },
    })
    if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(schedule)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch deferral schedule' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { lineId, postPeriod, status } = body

    // Post a specific period line
    if (postPeriod && lineId) {
      const line = await prisma.deferralLine.findUnique({ where: { id: lineId } })
      if (!line) return NextResponse.json({ error: 'Line not found' }, { status: 404 })
      if (line.isPosted) return NextResponse.json({ error: 'Line already posted' }, { status: 400 })

      await prisma.deferralLine.update({
        where: { id: lineId },
        data: { isPosted: true, postedAt: new Date() },
      })

      // Update recognized amount on schedule
      const schedule = await prisma.deferralSchedule.findUnique({ where: { id }, include: { lines: true } })
      if (schedule) {
        const recognized = schedule.lines.reduce((s, l) => s + (l.isPosted || l.id === lineId ? l.amount : 0), 0)
        const allPosted = schedule.lines.every(l => l.isPosted || l.id === lineId)
        await prisma.deferralSchedule.update({
          where: { id },
          data: {
            recognizedAmt: recognized,
            status: allPosted ? 'completed' : 'active',
          },
        })
      }

      const updated = await prisma.deferralSchedule.findUnique({
        where: { id },
        include: { template: true, lines: { orderBy: { periodDate: 'asc' } } },
      })
      return NextResponse.json(updated)
    }

    // General status update
    if (status) {
      const updated = await prisma.deferralSchedule.update({
        where: { id },
        data: { status },
        include: { template: true, lines: { orderBy: { periodDate: 'asc' } } },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update deferral schedule' }, { status: 500 })
  }
}
