import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const products = await prisma.salesOpportunityProduct.findMany({
      where: { opportunityId: id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const lineTotal = body.quantity * body.pricePerUnit * (1 - (body.discount || 0) / 100)
    const product = await prisma.salesOpportunityProduct.create({
      data: { ...body, opportunityId: id, lineTotal },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 })
  }
}
