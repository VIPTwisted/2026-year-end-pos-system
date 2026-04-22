import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const affiliate = await prisma.affiliate.findUnique({
    where: { id },
    include: {
      program: true,
      referrals: { orderBy: { createdAt: 'desc' } },
      commissions: { orderBy: { createdAt: 'desc' } },
      payouts: { orderBy: { period: 'desc' } },
      links: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!affiliate) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(affiliate)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const affiliate = await prisma.affiliate.update({ where: { id }, data: body })
  return NextResponse.json(affiliate)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.affiliate.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
