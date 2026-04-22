import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { name, firstResponseHours, resolutionHours, isActive } = body

  const policy = await prisma.caseSLA.update({
    where: { id },
    data: {
      ...(name !== undefined               && { name }),
      ...(firstResponseHours !== undefined && { firstResponseHours }),
      ...(resolutionHours !== undefined    && { resolutionHours }),
      ...(isActive !== undefined           && { isActive }),
    },
  })
  return NextResponse.json(policy)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.caseSLA.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
