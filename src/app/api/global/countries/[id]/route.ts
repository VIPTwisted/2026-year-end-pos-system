import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const country = await prisma.countryConfig.findUnique({ where: { id } })
  if (!country) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(country)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const country = await prisma.countryConfig.update({ where: { id }, data: body })
  return NextResponse.json(country)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.countryConfig.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
