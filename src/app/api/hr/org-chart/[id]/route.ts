import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const node = await prisma.orgNode.findUnique({ where: { id } })
    if (!node) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(node)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch org node' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const node = await prisma.orgNode.update({ where: { id }, data: body })
    return NextResponse.json(node)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update org node' }, { status: 500 })
  }
}
