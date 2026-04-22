import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const flag = await prisma.featureFlag.findUnique({ where: { id: params.id } })
  if (!flag) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(flag)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const data: Record<string, unknown> = { ...body }
  if (body.status === 'enabled') data.enabledAt = new Date()
  if (body.status === 'disabled') data.enabledAt = null
  const flag = await prisma.featureFlag.update({ where: { id: params.id }, data })
  return NextResponse.json(flag)
}
