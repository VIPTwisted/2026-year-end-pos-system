import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { lines } = await req.json()
  for (const l of lines) {
    await prisma.inboundShipmentLine.update({
      where: { id: l.lineId },
      data: { receivedQty: l.receivedQty, damagedQty: l.damagedQty || 0, status: l.receivedQty < l.expectedQty ? 'discrepancy' : 'received' },
    })
  }
  const allLines = await prisma.inboundShipmentLine.findMany({ where: { shipmentId: id } })
  const hasDiscrepancy = allLines.some(l => l.status === 'discrepancy')
  await prisma.inboundShipment.update({ where: { id }, data: { status: hasDiscrepancy ? 'discrepancy' : 'received', arrivedDate: new Date() } })
  return NextResponse.json({ ok: true })
}
