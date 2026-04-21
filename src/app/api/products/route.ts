import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const active = req.nextUrl.searchParams.get('active')
  const products = await prisma.product.findMany({
    where: active === 'true' ? { isActive: true } : undefined,
    include: { category: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const product = await prisma.product.create({ data: body })
  return NextResponse.json(product, { status: 201 })
}
