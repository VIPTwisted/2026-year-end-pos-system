import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const opp = await prisma.salesOpportunity.findUnique({
      where: { id },
      include: { products: true, quotes: { include: { items: true } } },
    })
    if (!opp) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(opp)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const opp = await prisma.salesOpportunity.update({
      where: { id },
      data: body,
      include: { products: true, quotes: true },
    })
    return NextResponse.json(opp)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 })
  }
}
