import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const queues = await prisma.callQueue.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(queues)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const queue = await prisma.callQueue.create({
      data: {
        name: body.name,
        maxLength: body.maxLength ?? 20,
        waitMusic: body.waitMusic ?? null,
        overflowQueueId: body.overflowQueueId ?? null,
        timeoutSeconds: body.timeoutSeconds ?? 300,
        priorityRules: body.priorityRules ?? null,
        overflowAction: body.overflowAction ?? 'voicemail',
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(queue, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
