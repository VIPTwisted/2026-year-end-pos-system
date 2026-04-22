import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const codes = await prisma.regionTaxCode.findMany({
    where: { regionId: id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(codes)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { code, description, rate, category, productTypes } = body
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 })
  const record = await prisma.regionTaxCode.create({
    data: {
      regionId: id,
      code,
      description: description ?? null,
      rate: parseFloat(rate ?? 0),
      category: category ?? 'standard',
      productTypes: Array.isArray(productTypes)
        ? JSON.stringify(productTypes)
        : JSON.stringify((productTypes ?? '').split(',').map((s: string) => s.trim()).filter(Boolean)),
    },
  })
  return NextResponse.json(record, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: _regionId } = await params
  const url = new URL(req.url)
  const cid = url.searchParams.get('cid')
  if (!cid) return NextResponse.json({ error: 'cid required' }, { status: 400 })
  await prisma.regionTaxCode.delete({ where: { id: cid } })
  return NextResponse.json({ success: true })
}
