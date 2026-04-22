import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp         = req.nextUrl.searchParams
    const customerId = sp.get('customerId') ?? undefined
    const caseId     = sp.get('caseId')     ?? undefined

    const communications = await prisma.communication.findMany({
      where: {
        ...(customerId ? { customerId } : {}),
        // @ts-ignore
        ...(caseId     ? { caseId }     : {}),
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    return NextResponse.json(communications)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      customerId: string
      caseId?: string
      channel: string
      direction: string
      subject?: string
      content: string
      status?: string
    }

    const { customerId, caseId, channel, direction, subject, content, status } = body

    if (!customerId || !channel || !direction || !content) {
      return NextResponse.json(
        { error: 'customerId, channel, direction, and content are required' },
        { status: 400 }
      )
    }

    const communication = await prisma.communication.create({
      data: {
        customerId,
        // @ts-ignore
        caseId:  caseId  ?? null,
        channel,
        direction,
        subject: subject ?? null,
        content,
        status:  status  ?? 'sent',
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(communication, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
