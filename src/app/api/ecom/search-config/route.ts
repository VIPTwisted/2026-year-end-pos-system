import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const configs = await prisma.ecomSearchConfig.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(configs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const config = await prisma.ecomSearchConfig.create({
    data: {
      name: body.name,
      channelId: body.channelId ?? null,
      boostFields: body.boostFields ? JSON.stringify(body.boostFields) : '[]',
      facets: body.facets ? JSON.stringify(body.facets) : '[]',
      synonyms: body.synonyms ? JSON.stringify(body.synonyms) : '[]',
      stopWords: body.stopWords ? JSON.stringify(body.stopWords) : '[]',
      minSearchLength: body.minSearchLength ?? 2,
      maxResults: body.maxResults ?? 48,
      enableAutocomplete: body.enableAutocomplete ?? true,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(config, { status: 201 })
}
