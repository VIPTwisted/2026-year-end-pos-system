import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json().catch(() => ({}))
    const ra = await prisma.returnAuthorization.update({
      where: { id },
      data: {
        status: 'denied',
        notes: body.notes ?? undefined,
      },
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
