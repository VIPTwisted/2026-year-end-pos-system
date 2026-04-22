import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const asset = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(asset)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const asset = await prisma.mediaAsset.update({ where: { id }, data: body })
  return NextResponse.json(asset)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.mediaAsset.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
