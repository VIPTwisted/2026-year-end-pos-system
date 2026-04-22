import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (status && status !== 'all') where.status = status

  const sales = await prisma.flashSale.findMany({
    where,
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(sales)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, productName, originalPrice, salePrice, quantity, duration } = body

  if (!name || !productName || salePrice == null) {
    return NextResponse.json({ error: 'name, productName, and salePrice are required' }, { status: 400 })
  }

  const sale = await prisma.flashSale.create({
    data: {
      name,
      productName,
      originalPrice: parseFloat(originalPrice) || 0,
      salePrice: parseFloat(salePrice),
      quantity: parseInt(quantity) || 50,
      duration: parseInt(duration) || 300,
      status: 'pending',
    },
  })

  return NextResponse.json(sale, { status: 201 })
}
