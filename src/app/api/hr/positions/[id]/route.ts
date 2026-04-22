import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const position = await prisma.hRPosition.findUnique({ where: { id } })
    if (!position) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(position)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch position' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const position = await prisma.hRPosition.update({ where: { id }, data: body })
    return NextResponse.json(position)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update position' }, { status: 500 })
  }
}
