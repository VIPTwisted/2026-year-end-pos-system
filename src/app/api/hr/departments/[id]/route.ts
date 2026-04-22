import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const dept = await prisma.department.findUnique({ where: { id } })
    if (!dept) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(dept)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const dept = await prisma.department.update({ where: { id }, data: body })
    return NextResponse.json(dept)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 })
  }
}
