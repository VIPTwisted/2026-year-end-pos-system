import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const languageCode = searchParams.get('languageCode')
  const entityType = searchParams.get('entityType')

  const where: Record<string, unknown> = {}
  if (languageCode) where.languageCode = languageCode
  if (entityType && entityType !== 'all') where.entityType = entityType

  const translations = await prisma.translation.findMany({
    where,
    orderBy: [{ entityType: 'asc' }, { key: 'asc' }],
  })
  return NextResponse.json(translations)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { languageCode, entityType, entityId, key, value } = body
  if (!languageCode || !entityType || !key || value === undefined) {
    return NextResponse.json({ error: 'languageCode, entityType, key, value required' }, { status: 400 })
  }
  const translation = await prisma.translation.upsert({
    where: {
      languageCode_entityType_entityId_key: {
        languageCode,
        entityType,
        entityId: entityId ?? null,
        key,
      },
    },
    update: { value, updatedAt: new Date() },
    create: { languageCode, entityType, entityId: entityId ?? null, key, value },
  })
  return NextResponse.json(translation, { status: 201 })
}
