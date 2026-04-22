import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { approverName, comments } = body

    const approval = await prisma.b2BApproval.findFirst({
      where: { reqId: id, status: 'pending' },
      orderBy: { createdAt: 'asc' },
    })

    if (approval) {
      await prisma.b2BApproval.update({
        where: { id: approval.id },
        data: {
          status: 'approved',
          approverName: approverName ?? approval.approverName,
          comments: comments ?? null,
          actedAt: new Date(),
        },
      })
    }

    const updated = await prisma.b2BRequisition.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy: approverName ?? null,
        approvedAt: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to approve requisition' }, { status: 500 })
  }
}
