import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const updated = await prisma.lead.update({
    where: { id },
    data: { status: 'converted', convertedAt: new Date() },
  })
  return NextResponse.json(updated)
}
