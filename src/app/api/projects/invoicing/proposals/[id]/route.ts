import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const proposal = await prisma.projectInvoiceProposal.findUnique({
      where: { id: params.id },
      include: {
        project: { select: { id: true, projectNo: true, description: true } },
      },
    })
    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(proposal)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch proposal' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    // If action is 'post', stamp postedAt
    const data = body.action === 'post'
      ? { status: 'posted', postedAt: new Date(), postedBy: body.postedBy ?? 'system' }
      : body
    const proposal = await prisma.projectInvoiceProposal.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(proposal)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 })
  }
}
