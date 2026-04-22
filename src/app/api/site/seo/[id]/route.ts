import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const config = await prisma.siteSeoConfig.findUnique({ where: { id } })
  if (!config) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(config)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const config = await prisma.siteSeoConfig.update({ where: { id }, data: body })
  return NextResponse.json(config)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.siteSeoConfig.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
