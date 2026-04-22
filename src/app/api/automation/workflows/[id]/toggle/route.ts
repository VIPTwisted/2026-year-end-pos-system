import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const current = await prisma.automationWorkflow.findUnique({ where: { id }, select: { isActive: true } })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const updated = await prisma.automationWorkflow.update({
    where: { id },
    data: { isActive: !current.isActive },
  })
  return NextResponse.json(updated)
}
