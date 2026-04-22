import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const activities = await prisma.leadActivity.findMany({
    where: { leadId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(activities)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const activity = await prisma.leadActivity.create({
    data: {
      leadId: id,
      activityType: body.activityType ?? 'note',
      subject: body.subject ?? null,
      notes: body.notes ?? null,
      outcome: body.outcome ?? null,
      recordedBy: body.recordedBy ?? null,
    },
  })
  return NextResponse.json(activity, { status: 201 })
}
