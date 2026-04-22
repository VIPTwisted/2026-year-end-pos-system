import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await prisma.priceRule.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const rule = await prisma.priceRule.update({
      where: { id },
      data: { isActive: !existing.isActive },
    })
    return NextResponse.json(rule)
  } catch (error) {
    console.error('POST /api/pricing/rules/[id]/toggle error:', error)
    return NextResponse.json({ error: 'Failed to toggle rule' }, { status: 500 })
  }
}
