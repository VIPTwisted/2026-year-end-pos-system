import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const req = await prisma.b2BRequisition.findUnique({
      where: { id },
      include: {
        lines: { orderBy: { createdAt: 'asc' } },
        approvals: { orderBy: { createdAt: 'asc' } },
        org: true,
      },
    })
    if (!req) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(req)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch requisition' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { requestedBy, status, rejectionReason, approvedBy, approvedAt } = body

    const updated = await prisma.b2BRequisition.update({
      where: { id },
      data: {
        ...(requestedBy !== undefined ? { requestedBy } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(rejectionReason !== undefined ? { rejectionReason } : {}),
        ...(approvedBy !== undefined ? { approvedBy } : {}),
        ...(approvedAt !== undefined ? { approvedAt: approvedAt ? new Date(approvedAt) : null } : {}),
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update requisition' }, { status: 500 })
  }
}
