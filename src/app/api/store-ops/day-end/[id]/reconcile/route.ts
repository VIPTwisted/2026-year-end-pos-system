import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { reconciledBy } = await req.json()
  const result = await prisma.dayEndProcedure.update({
    where: { id },
    data: { status: 'reconciled', reconciledBy, reconciledAt: new Date() },
  })
  return NextResponse.json(result)
}
