import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body: { lineId: string; receivedQty: number }[] = await req.json()

  await Promise.all(
    body.map(async ({ lineId, receivedQty }) => {
      const line = await prisma.vpVendorPOLine.findUnique({ where: { id: lineId } })
      if (!line) return
      const newReceived = Math.min(receivedQty, line.qty)
      const lineStatus = newReceived >= line.qty ? 'received' : newReceived > 0 ? 'partial' : 'open'
      await prisma.vpVendorPOLine.update({
        where: { id: lineId },
        data: { receivedQty: newReceived, status: lineStatus },
      })
    })
  )

  const lines = await prisma.vpVendorPOLine.findMany({ where: { poId: id } })
  const allReceived = lines.every((l) => l.receivedQty >= l.qty)
  const anyReceived = lines.some((l) => l.receivedQty > 0)
  const overallStatus = allReceived ? 'received' : anyReceived ? 'partial' : 'acknowledged'

  const po = await prisma.vpVendorPO.update({
    where: { id },
    data: { status: overallStatus },
    include: { lines: true },
  })

  return NextResponse.json(po)
}
