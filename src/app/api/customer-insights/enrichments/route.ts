import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest) {
  const enrichments = await prisma.cIEnrichment.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(enrichments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const enrichment = await prisma.cIEnrichment.create({
    data: {
      enrichmentName: body.enrichmentName,
      provider: body.provider ?? 'internal',
      enrichmentType: body.enrichmentType ?? 'demographics',
      status: body.status ?? 'inactive',
      configJson: body.configJson ?? null,
    },
  })
  return NextResponse.json(enrichment, { status: 201 })
}
