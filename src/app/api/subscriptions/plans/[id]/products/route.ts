import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const products = await prisma.subscriptionPlanProduct.findMany({
    where: { planId: id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const product = await prisma.subscriptionPlanProduct.create({
    data: { planId: id, ...body },
  })
  return NextResponse.json(product, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: _planId } = await params
  const { pid } = await req.json()
  await prisma.subscriptionPlanProduct.delete({ where: { id: pid } })
  return NextResponse.json({ success: true })
}
