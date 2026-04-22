import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const groups = await prisma.qualityTestGroup.findMany({
    include: { tests: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(groups)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, tests } = body

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  type RawTest = {
    name: string
    testType?: string
    minValue?: number | null
    maxValue?: number | null
    unit?: string | null
  }

  const group = await prisma.qualityTestGroup.create({
    data: {
      name,
      description: description ?? null,
      tests: tests && Array.isArray(tests) && tests.length > 0
        ? {
            create: (tests as RawTest[]).map((t) => ({
              name: t.name,
              testType: t.testType ?? 'quantity',
              minValue: t.minValue ?? null,
              maxValue: t.maxValue ?? null,
              unit: t.unit ?? null,
            })),
          }
        : undefined,
    },
    include: { tests: true },
  })

  return NextResponse.json(group, { status: 201 })
}
