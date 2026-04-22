import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const config = await prisma.ecomSearchConfig.findUnique({ where: { id } })
  if (!config) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(config)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const config = await prisma.ecomSearchConfig.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.channelId !== undefined && { channelId: body.channelId }),
      ...(body.boostFields !== undefined && { boostFields: JSON.stringify(body.boostFields) }),
      ...(body.facets !== undefined && { facets: JSON.stringify(body.facets) }),
      ...(body.synonyms !== undefined && { synonyms: JSON.stringify(body.synonyms) }),
      ...(body.stopWords !== undefined && { stopWords: JSON.stringify(body.stopWords) }),
      ...(body.minSearchLength !== undefined && { minSearchLength: body.minSearchLength }),
      ...(body.maxResults !== undefined && { maxResults: body.maxResults }),
      ...(body.enableAutocomplete !== undefined && { enableAutocomplete: body.enableAutocomplete }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  })
  return NextResponse.json(config)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.ecomSearchConfig.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
