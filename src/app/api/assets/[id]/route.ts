import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const asset = await prisma.enterpriseAsset.findUnique({ where: { id } })
    if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(asset)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const asset = await prisma.enterpriseAsset.update({ where: { id }, data: body })
    return NextResponse.json(asset)
  } catch {
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
  }
}
