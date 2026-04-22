import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const creator = await prisma.creator.findUnique({
    where: { id },
    include: { payouts: { orderBy: { createdAt: 'desc' } } },
  })
  if (!creator) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(creator)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const creator = await prisma.creator.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.handle !== undefined ? { handle: body.handle } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.platforms !== undefined ? { platforms: typeof body.platforms === 'string' ? body.platforms : JSON.stringify(body.platforms) } : {}),
      ...(body.tier !== undefined ? { tier: body.tier } : {}),
      ...(body.commissionRate !== undefined ? { commissionRate: parseFloat(body.commissionRate) } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.totalSales !== undefined ? { totalSales: parseFloat(body.totalSales) } : {}),
      ...(body.totalCommission !== undefined ? { totalCommission: parseFloat(body.totalCommission) } : {}),
    },
  })
  return NextResponse.json(creator)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.creator.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
