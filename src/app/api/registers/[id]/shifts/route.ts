import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shifts = await prisma.registerShift.findMany({
    where: { registerId: id },
    orderBy: { openedAt: 'desc' },
  })
  return NextResponse.json(shifts)
}
