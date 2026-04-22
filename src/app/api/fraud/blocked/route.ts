import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const blocked = await prisma.blockedEntity.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(blocked)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entity = await prisma.blockedEntity.create({
    data: {
      entityType: body.entityType,
      entityValue: body.entityValue,
      reason: body.reason ?? null,
      blockedBy: body.blockedBy ?? null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(entity, { status: 201 })
}
