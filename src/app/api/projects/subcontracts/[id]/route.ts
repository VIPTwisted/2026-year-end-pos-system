import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sub = await prisma.projectSubcontract.findUnique({
      where: { id: params.id },
      include: {
        project: { select: { id: true, projectNo: true, description: true } },
        vendor:  { select: { id: true, vendorCode: true, name: true } },
      },
    })
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(sub)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch subcontract' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const sub = await prisma.projectSubcontract.update({
      where: { id: params.id },
      data:  body,
    })
    return NextResponse.json(sub)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update subcontract' }, { status: 500 })
  }
}
