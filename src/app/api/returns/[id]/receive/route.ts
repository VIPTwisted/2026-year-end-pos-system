import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const { lines } = body as {
      lines: Array<{
        id: string
        qtyReceived: number
        condition?: string
        disposition?: string
      }>
    }

    if (lines?.length) {
      await Promise.all(
        lines.map((l) =>
          prisma.returnLine.update({
            where: { id: l.id },
            data: {
              qtyReceived: Number(l.qtyReceived) || 0,
              condition: l.condition ?? undefined,
              disposition: l.disposition ?? undefined,
            },
          })
        )
      )
    }

    const ra = await prisma.returnAuthorization.update({
      where: { id },
      data: { status: 'received' },
      include: {
        lines: { orderBy: { createdAt: 'asc' } },
        inspection: true,
        refundRecord: true,
      },
    })
    return NextResponse.json(ra)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
