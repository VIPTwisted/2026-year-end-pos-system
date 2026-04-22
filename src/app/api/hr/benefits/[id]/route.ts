import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const benefit = await prisma.hRBenefit.findUnique({
      where: { id },
      include: { enrollments: { orderBy: { createdAt: 'desc' } } },
    })
    if (!benefit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(benefit)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch benefit' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const benefit = await prisma.hRBenefit.update({ where: { id }, data: body })
    return NextResponse.json(benefit)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update benefit' }, { status: 500 })
  }
}
