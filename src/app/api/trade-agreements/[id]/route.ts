import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agreement = await prisma.tradeAgreement.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      vendor: { select: { id: true, name: true } },
      lines: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      },
    },
  })
  if (!agreement) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(agreement)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const agreement = await prisma.tradeAgreement.update({ where: { id }, data: body })
  return NextResponse.json(agreement)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.tradeAgreement.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
