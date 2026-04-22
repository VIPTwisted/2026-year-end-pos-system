import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const activities = await prisma.caseActivity.findMany({
    where: { caseId: id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(activities)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { activityType, body: msgBody, authorName, isInternal, emailSubject, duration } = body

  if (!msgBody) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 })
  }

  if (!isInternal) {
    const existing = await prisma.serviceCase.findUnique({ where: { id } })
    if (existing && !existing.firstResponseAt) {
      await prisma.serviceCase.update({
        where: { id },
        data: { firstResponseAt: new Date(), status: 'in-progress' },
      })
    }
  }

  const activity = await prisma.caseActivity.create({
    data: {
      caseId:       id,
      activityType: activityType ?? 'note',
      body:         msgBody,
      authorName:   authorName   ?? null,
      isInternal:   isInternal   ?? false,
      emailSubject: emailSubject ?? null,
      duration:     duration     ?? null,
    },
  })

  return NextResponse.json(activity, { status: 201 })
}
