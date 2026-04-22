import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ra = await prisma.returnAuthorization.findUnique({
    where: { id },
    include: {
      lines: { orderBy: { createdAt: 'asc' } },
      inspection: true,
      refundRecord: true,
    },
  })
  if (!ra) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ra)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const ra = await prisma.returnAuthorization.update({
      where: { id },
      data: body,
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
