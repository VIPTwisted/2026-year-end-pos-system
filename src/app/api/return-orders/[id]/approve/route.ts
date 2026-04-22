import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ret = await prisma.returnOrder.update({
    where: { id },
    data: { status: 'approved' },
    include: { lines: true },
  })
  return NextResponse.json(ret)
}
