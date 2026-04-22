import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const doc = await prisma.fiscalDocument.findUnique({
      where: { id },
      include: { device: true },
    })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(doc)
  } catch (error) {
    console.error('[GET /api/fiscal/documents/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    const doc = await prisma.fiscalDocument.update({
      where: { id },
      data: {
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.fiscalCode !== undefined ? { fiscalCode: body.fiscalCode } : {}),
        ...(body.fiscalSign !== undefined ? { fiscalSign: body.fiscalSign } : {}),
        ...(body.errorMessage !== undefined ? { errorMessage: body.errorMessage } : {}),
        ...(body.retryCount !== undefined ? { retryCount: body.retryCount } : {}),
      },
      include: { device: { select: { name: true } } },
    })

    return NextResponse.json(doc)
  } catch (error) {
    console.error('[PATCH /api/fiscal/documents/[id]]', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}
