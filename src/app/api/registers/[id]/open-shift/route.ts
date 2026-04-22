import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const shift = await prisma.registerShift.create({
    data: {
      registerId: id,
      cashierName: body.cashierName,
      openingFloat: body.openingFloat ?? 0,
      status: 'open',
    },
  })
  await prisma.pOSRegister.update({ where: { id }, data: { status: 'online', lastActivityAt: new Date() } })
  return NextResponse.json(shift, { status: 201 })
}
