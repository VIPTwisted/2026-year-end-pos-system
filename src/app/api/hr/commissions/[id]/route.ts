import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as { status?: string; notes?: string }

    const existing = await prisma.commission.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    const allowedTransitions: Record<string, string[]> = {
      pending: ['approved'],
      approved: ['paid'],
      paid: [],
    }

    if (body.status !== undefined) {
      const allowed = allowedTransitions[existing.status] ?? []
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${existing.status} to ${body.status}` },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.commission.update({
      where: { id },
      data: {
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.status === 'paid' ? { paidAt: new Date() } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      },
      include: {
        employee: true,
        order: true,
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
