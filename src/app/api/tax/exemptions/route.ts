import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const exemptions = await prisma.taxExemption.findMany({
    orderBy: { exemptionCode: 'asc' },
  })
  return NextResponse.json(exemptions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const exemption = await prisma.taxExemption.create({
    data: {
      exemptionCode: body.exemptionCode,
      exemptionName: body.exemptionName,
      exemptionType: body.exemptionType,
      customerId: body.customerId ?? null,
      customerName: body.customerName ?? null,
      certificateNumber: body.certificateNumber ?? null,
      issuedState: body.issuedState ?? null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(exemption, { status: 201 })
}
