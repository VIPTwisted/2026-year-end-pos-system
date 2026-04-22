import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.cIEnrichment.update({
    where: { id },
    data: {
      ...(body.enrichmentName !== undefined && { enrichmentName: body.enrichmentName }),
      ...(body.provider !== undefined && { provider: body.provider }),
      ...(body.enrichmentType !== undefined && { enrichmentType: body.enrichmentType }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.profilesEnriched !== undefined && { profilesEnriched: body.profilesEnriched }),
      ...(body.configJson !== undefined && { configJson: body.configJson }),
    },
  })
  return NextResponse.json(updated)
}
