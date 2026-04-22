import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const nexus = await prisma.taxNexus.update({
    where: { id },
    data: {
      hasNexus: body.hasNexus,
      nexusType: body.nexusType,
      thresholdAmt: body.thresholdAmt,
      registrationNumber: body.registrationNumber,
      effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : undefined,
      notes: body.notes,
    },
  })
  return NextResponse.json(nexus)
}
