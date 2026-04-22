import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const binId = searchParams.get('binId')
  const zoneId = searchParams.get('zoneId')
  const storeId = searchParams.get('storeId')
  const productId = searchParams.get('productId')

  const where: Record<string, unknown> = {}
  if (binId) where.binId = binId
  if (productId) where.productId = productId
  if (zoneId || storeId) {
    where.bin = {}
    if (zoneId) (where.bin as Record<string, unknown>).zoneId = zoneId
    if (storeId) (where.bin as Record<string, unknown>).storeId = storeId
  }

  const contents = await prisma.warehouseBinContent.findMany({
    where,
    include: {
      bin: {
        select: {
          code: true,
          id: true,
          zone: { select: { code: true } },
          store: { select: { name: true } },
        },
      },
      product: { select: { name: true, sku: true } },
    },
    orderBy: [{ bin: { code: 'asc' } }],
  })

  return NextResponse.json(contents)
}
