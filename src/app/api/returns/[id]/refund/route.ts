import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const { refundMethod, refundAmount, transactionId, processedBy } = body as {
      refundMethod?: string
      refundAmount: number
      transactionId?: string
      processedBy?: string
    }

    const refundRecord = await prisma.returnRefund.create({
      data: {
        returnAuthorizationId: id,
        refundMethod: refundMethod ?? null,
        refundAmount: Number(refundAmount) || 0,
        transactionId: transactionId ?? null,
        processedBy: processedBy ?? 'System',
        processedAt: new Date(),
      },
    })

    const ra = await prisma.returnAuthorization.update({
      where: { id },
      data: {
        status: 'complete',
        totalRefund: Number(refundAmount) || 0,
        refundMethod: refundMethod ?? undefined,
      },
      include: {
        lines: { orderBy: { createdAt: 'asc' } },
        inspection: true,
        refundRecord: true,
      },
    })

    return NextResponse.json({ ...ra, refundRecord })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
