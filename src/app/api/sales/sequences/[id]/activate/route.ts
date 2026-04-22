import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const seq = await prisma.salesSequence.findUnique({ where: { id } })
    if (!seq) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const newStatus = seq.status === 'active' ? 'draft' : 'active'
    const sequence = await prisma.salesSequence.update({
      where: { id },
      data: { status: newStatus },
    })
    return NextResponse.json(sequence)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle sequence status' }, { status: 500 })
  }
}
