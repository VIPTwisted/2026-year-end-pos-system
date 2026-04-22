import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const entity = await prisma.blockedEntity.update({
    where: { id },
    data: {
      reason: body.reason,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      isActive: body.isActive,
    },
  })
  return NextResponse.json(entity)
}
