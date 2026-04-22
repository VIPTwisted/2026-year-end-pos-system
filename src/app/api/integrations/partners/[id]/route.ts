import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const partner = await prisma.integrationPartner.findUnique({ where: { id } })
  if (!partner) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(partner)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const partner = await prisma.integrationPartner.update({ where: { id }, data: body })
  return NextResponse.json(partner)
}
