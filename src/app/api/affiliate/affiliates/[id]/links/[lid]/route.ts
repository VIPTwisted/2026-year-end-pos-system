import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lid: string }> }
) {
  const { lid } = await params
  const body = await req.json()

  if (body.action === 'click') {
    const link = await prisma.affiliateLink.update({
      where: { id: lid },
      data: { clicks: { increment: 1 } },
    })
    return NextResponse.json(link)
  }

  const link = await prisma.affiliateLink.update({ where: { id: lid }, data: body })
  return NextResponse.json(link)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; lid: string }> }
) {
  const { lid } = await params
  await prisma.affiliateLink.delete({ where: { id: lid } })
  return NextResponse.json({ ok: true })
}
