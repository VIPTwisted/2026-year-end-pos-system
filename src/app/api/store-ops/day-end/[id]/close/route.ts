import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { closedBy, cashCounted } = await req.json()
  const procedure = await prisma.dayEndProcedure.findUnique({ where: { id } })
  if (!procedure) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const counted = parseFloat(cashCounted) || 0
  const result = await prisma.dayEndProcedure.update({
    where: { id },
    data: { status: 'closed', closedBy, closedAt: new Date(), cashCounted: counted, cashVariance: counted - procedure.cashExpected },
  })
  return NextResponse.json(result)
}
