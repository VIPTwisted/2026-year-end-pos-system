import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const {
    name, referenceType, productFilter, vendorFilter,
    samplingMethod, sampleSize, samplePct, testGroupId, autoCreate, isActive,
  } = body

  const updated = await prisma.qualityInspectionPlan.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(referenceType ? { referenceType } : {}),
      ...(productFilter !== undefined ? { productFilter } : {}),
      ...(vendorFilter !== undefined ? { vendorFilter } : {}),
      ...(samplingMethod ? { samplingMethod } : {}),
      ...(sampleSize !== undefined ? { sampleSize: Number(sampleSize) } : {}),
      ...(samplePct !== undefined ? { samplePct: samplePct ? Number(samplePct) : null } : {}),
      ...(testGroupId !== undefined ? { testGroupId } : {}),
      ...(autoCreate !== undefined ? { autoCreate } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.qualityInspectionPlan.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
