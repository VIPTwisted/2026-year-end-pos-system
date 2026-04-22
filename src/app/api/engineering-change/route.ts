import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')

  const where: Record<string, string> = {}
  if (status) where.status = status
  if (type) where.changeType = type

  const ecos = await prisma.engineeringChangeOrder.findMany({
    where,
    include: { lines: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(ecos)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, changeType, priority, description, requestedBy, effectiveDate, lines = [] } = body

  const count = await prisma.engineeringChangeOrder.count()
  const ecoNumber = `ECO-${String(count + 1).padStart(5, '0')}`

  const eco = await prisma.engineeringChangeOrder.create({
    data: {
      ecoNumber,
      title,
      changeType: changeType ?? 'design',
      priority: priority ?? 'normal',
      description: description || null,
      requestedBy: requestedBy || null,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
      affectedItems: lines.length,
      lines: {
        create: lines.map((l: { lineType?: string; productId?: string; bomId?: string; changeDesc: string; fromValue?: string; toValue?: string }) => ({
          lineType: l.lineType ?? 'product',
          productId: l.productId || null,
          bomId: l.bomId || null,
          changeDesc: l.changeDesc,
          fromValue: l.fromValue || null,
          toValue: l.toValue || null,
        })),
      },
    },
    include: { lines: true },
  })
  return NextResponse.json(eco, { status: 201 })
}
