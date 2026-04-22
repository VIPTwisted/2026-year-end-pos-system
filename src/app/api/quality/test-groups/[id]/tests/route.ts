import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, testType, minValue, maxValue, unit } = body

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const group = await prisma.qualityTestGroup.findUnique({ where: { id } })
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  const test = await prisma.qualityTest.create({
    data: {
      groupId: id,
      name,
      testType: testType ?? 'quantity',
      minValue: minValue ?? null,
      maxValue: maxValue ?? null,
      unit: unit ?? null,
    },
  })

  return NextResponse.json(test, { status: 201 })
}
