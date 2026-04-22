import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const sales = await prisma.flashSale.findMany({
    where: status && status !== 'all' ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(sales)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const sale = await prisma.flashSale.create({
    data: {
      name: body.name,
      showId: body.showId ?? null,
      productName: body.productName,
      originalPrice: parseFloat(body.originalPrice) || 0,
      salePrice: parseFloat(body.salePrice) || 0,
      quantity: parseInt(body.quantity) || 10,
      duration: parseInt(body.duration) || 300,
    },
  })
  return NextResponse.json(sale, { status: 201 })
}
