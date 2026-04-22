import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const openShift = await prisma.registerShift.findFirst({
    where: { registerId: id, status: 'open' },
  })
  if (!openShift) return NextResponse.json({ error: 'No open shift' }, { status: 400 })
  const shift = await prisma.registerShift.update({
    where: { id: openShift.id },
    data: {
      closedAt: new Date(),
      closingFloat: body.closingFloat ?? 0,
      netSales: body.netSales ?? 0,
      transactions: body.transactions ?? 0,
      status: 'closed',
    },
  })
  await prisma.pOSRegister.update({ where: { id }, data: { status: 'offline' } })
  return NextResponse.json(shift)
}
