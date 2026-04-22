import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.cIDataGovernancePolicy.update({
    where: { id },
    data: {
      ...(body.policyName !== undefined && { policyName: body.policyName }),
      ...(body.policyType !== undefined && { policyType: body.policyType }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.configJson !== undefined && { configJson: body.configJson }),
      ...(body.isEnabled !== undefined && { isEnabled: body.isEnabled }),
      ...(body.lastAuditAt !== undefined && { lastAuditAt: new Date(body.lastAuditAt) }),
    },
  })
  return NextResponse.json(updated)
}
