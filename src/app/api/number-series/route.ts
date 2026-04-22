import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const series = await prisma.numberSeries.findMany({
    include: {
      usageLogs: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { code: 'asc' },
  })
  return NextResponse.json(series)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    code, description, prefix, suffix,
    startingNo, incrementBy, endingNo, paddingLength,
    isDefault, allowManual,
  } = body

  if (!code || !description) {
    return NextResponse.json({ error: 'code and description are required' }, { status: 400 })
  }

  const existing = await prisma.numberSeries.findUnique({ where: { code } })
  if (existing) {
    return NextResponse.json({ error: `Code "${code}" already exists` }, { status: 409 })
  }

  const series = await prisma.numberSeries.create({
    data: {
      code,
      description,
      prefix: prefix ?? null,
      suffix: suffix ?? null,
      startingNo: startingNo ?? 1,
      lastNoUsed: 0,
      incrementBy: incrementBy ?? 1,
      endingNo: endingNo ?? null,
      paddingLength: paddingLength ?? 6,
      isDefault: isDefault ?? true,
      allowManual: allowManual ?? true,
    },
  })

  return NextResponse.json(series, { status: 201 })
}
