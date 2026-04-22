import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const request = await prisma.fMLARequest.findUnique({
      where: { id },
      include: { employee: { select: { firstName: true, lastName: true } } },
    })
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(request)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.action === 'approve') {
      data.status = 'approved'
    } else if (body.action === 'deny') {
      data.status = 'denied'
    } else if (body.action === 'activate') {
      data.status = 'active'
    } else if (body.action === 'close') {
      data.status = 'closed'
    } else {
      if (body.status) data.status = body.status
      if (body.hoursUsed !== undefined) data.hoursUsed = body.hoursUsed
      if (body.certReceived !== undefined) data.certReceived = body.certReceived
      if (body.notes !== undefined) data.notes = body.notes
      if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null
    }

    const updated = await prisma.fMLARequest.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
