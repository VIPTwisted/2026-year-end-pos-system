import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const plans = await prisma.qualityInspectionPlan.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    name, referenceType, productFilter, vendorFilter,
    samplingMethod, sampleSize, samplePct, testGroupId, autoCreate, isActive,
  } = body

  if (!name || !referenceType) {
    return NextResponse.json({ error: 'name and referenceType are required' }, { status: 400 })
  }

  const plan = await prisma.qualityInspectionPlan.create({
    data: {
      name,
      referenceType,
      productFilter: productFilter ?? null,
      vendorFilter: vendorFilter ?? null,
      samplingMethod: samplingMethod ?? 'fixed',
      sampleSize: Number(sampleSize) || 5,
      samplePct: samplePct ? Number(samplePct) : null,
      testGroupId: testGroupId ?? null,
      autoCreate: autoCreate !== false,
      isActive: isActive !== false,
    },
  })

  return NextResponse.json(plan, { status: 201 })
}
