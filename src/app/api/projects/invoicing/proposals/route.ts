import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const proposals = await prisma.projectInvoiceProposal.findMany({
      include: {
        project: { select: { id: true, projectNo: true, description: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(proposals)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const proposal = await prisma.projectInvoiceProposal.create({ data: body })
    return NextResponse.json(proposal, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 })
  }
}
