import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const values = await prisma.productAttributeValue.findMany({
    where: { productId: id },
    include: { attribute: true },
    orderBy: { attribute: { sortOrder: 'asc' } },
  })
  return NextResponse.json(values)
}

// POST body: { values: [{ attributeId, value }] } — upserts all
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { values } = await req.json()
  if (!Array.isArray(values)) return NextResponse.json({ error: 'values array required' }, { status: 400 })

  const results = await Promise.all(
    values.map(({ attributeId, value }: { attributeId: string; value: string }) =>
      prisma.productAttributeValue.upsert({
        where: { productId_attributeId: { productId: id, attributeId } },
        create: { productId: id, attributeId, value },
        update: { value },
      })
    )
  )
  return NextResponse.json(results)
}
