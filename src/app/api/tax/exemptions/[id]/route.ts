import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const exemption = await prisma.taxExemption.update({
    where: { id },
    data: {
      exemptionName: body.exemptionName,
      exemptionType: body.exemptionType,
      customerId: body.customerId,
      customerName: body.customerName,
      certificateNumber: body.certificateNumber,
      issuedState: body.issuedState,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      isActive: body.isActive,
    },
  })
  return NextResponse.json(exemption)
}
