import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function randomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function randomHex(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await prisma.fiscalDocument.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.status === 'signed' || existing.status === 'printed') {
      return NextResponse.json({ error: 'Document already signed' }, { status: 400 })
    }
    const doc = await prisma.fiscalDocument.update({
      where: { id },
      data: {
        fiscalCode: randomAlphanumeric(12),
        fiscalSign: randomHex(32),
        status: 'signed',
        errorMessage: null,
      },
      include: { device: { select: { name: true } } },
    })
    return NextResponse.json(doc)
  } catch (error) {
    console.error('[POST /api/fiscal/documents/[id]/sign]', error)
    return NextResponse.json({ error: 'Failed to sign document' }, { status: 500 })
  }
}
