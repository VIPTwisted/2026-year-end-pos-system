import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type TestEntry = {
  testName: string
  testType: string
  value: string
  minValue?: number | null
  maxValue?: number | null
  unit?: string | null
  notes?: string | null
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { tests, inspectedBy } = body as { tests: TestEntry[]; inspectedBy?: string }

  if (!tests || !Array.isArray(tests) || tests.length === 0) {
    return NextResponse.json({ error: 'tests array is required' }, { status: 400 })
  }

  const order = await prisma.qualityOrder.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.qualityResult.deleteMany({ where: { orderId: id } })

  const resultData = tests.map((t) => {
    let passed = false
    const rawVal = t.value ?? ''

    if (t.testType === 'boolean') {
      passed = rawVal.toLowerCase() === 'pass' || rawVal === 'true' || rawVal === '1'
    } else {
      const num = parseFloat(rawVal)
      if (!isNaN(num)) {
        const aboveMin = t.minValue == null || num >= t.minValue
        const belowMax = t.maxValue == null || num <= t.maxValue
        passed = aboveMin && belowMax
      }
    }

    return {
      orderId: id,
      testName: t.testName,
      testType: t.testType,
      value: rawVal,
      minValue: t.minValue ?? null,
      maxValue: t.maxValue ?? null,
      unit: t.unit ?? null,
      passed,
      notes: t.notes ?? null,
    }
  })

  await prisma.qualityResult.createMany({ data: resultData })

  const allPassed = resultData.every((r) => r.passed)
  const overallStatus = allPassed ? 'passed' : 'failed'

  const updated = await prisma.qualityOrder.update({
    where: { id },
    data: {
      status: overallStatus,
      inspectedBy: inspectedBy ?? order.inspectedBy ?? null,
      inspectedAt: new Date(),
    },
    include: { results: true },
  })

  return NextResponse.json({
    order: updated,
    summary: {
      total: resultData.length,
      passed: resultData.filter((r) => r.passed).length,
      failed: resultData.filter((r) => !r.passed).length,
      overallStatus,
    },
  })
}
