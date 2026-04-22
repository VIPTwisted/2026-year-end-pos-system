import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { approverName, approverEmail } = body

    const updated = await prisma.b2BRequisition.update({
      where: { id },
      data: { status: 'pending-approval' },
    })

    await prisma.b2BApproval.create({
      data: {
        reqId: id,
        approverName: approverName ?? 'Pending Approver',
        approverEmail: approverEmail ?? null,
        status: 'pending',
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to submit requisition' }, { status: 500 })
  }
}
