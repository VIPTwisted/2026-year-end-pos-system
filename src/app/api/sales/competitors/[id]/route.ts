import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const competitor = await prisma.competitor.update({ where: { id }, data: body })
    return NextResponse.json(competitor)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update competitor' }, { status: 500 })
  }
}
