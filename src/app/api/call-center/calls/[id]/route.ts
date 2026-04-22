import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const call = await prisma.callLog.findUnique({
      where: { id },
      include: {
        agent: true,
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
    })
    if (!call) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(call)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json() as Record<string, unknown>
    const allowed = ['outcome', 'notes', 'duration', 'callEndedAt', 'orderId']
    const data: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(body)) {
      if (!allowed.includes(k)) continue
      if (k === 'callEndedAt' && v) data[k] = new Date(v as string)
      else data[k] = v
    }
    const call = await prisma.callLog.update({ where: { id }, data })
    return NextResponse.json(call)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
