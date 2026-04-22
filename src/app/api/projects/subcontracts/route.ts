import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const subcontracts = await prisma.projectSubcontract.findMany({
      include: {
        project: { select: { id: true, projectNo: true, description: true } },
        vendor:  { select: { id: true, vendorCode: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(subcontracts)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch subcontracts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const subcontract = await prisma.projectSubcontract.create({ data: body })
    return NextResponse.json(subcontract, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create subcontract' }, { status: 500 })
  }
}
