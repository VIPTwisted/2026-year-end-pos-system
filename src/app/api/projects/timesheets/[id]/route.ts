import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ts = await prisma.timesheet.findUnique({
      where: { id: params.id },
      include: { lines: { orderBy: { dayDate: 'asc' } } },
    })
    if (!ts) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(ts)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { status, notes } = body

    const updates: Record<string, unknown> = {}
    if (status) {
      updates.status = status
      if (status === 'submitted') updates.submittedAt = new Date()
      if (status === 'approved')  updates.approvedAt  = new Date()
      if (status === 'rejected')  updates.rejectedAt  = new Date()
    }
    if (notes !== undefined) updates.notes = notes

    const ts = await prisma.timesheet.update({
      where: { id: params.id },
      data: updates,
      include: { lines: true },
    })
    return NextResponse.json(ts)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
