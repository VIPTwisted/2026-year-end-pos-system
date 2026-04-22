import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const channels = await prisma.voiceChannel.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(channels)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ch = await prisma.voiceChannel.create({
      data: {
        name: body.name,
        phoneNumber: body.phoneNumber,
        provider: body.provider ?? 'azure',
        status: body.status ?? 'inactive',
        queueId: body.queueId ?? null,
        maxConcurrent: body.maxConcurrent ?? 10,
        recordCalls: body.recordCalls ?? false,
        transcription: body.transcription ?? false,
        ivrFlowId: body.ivrFlowId ?? null,
      },
    })
    return NextResponse.json(ch, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
