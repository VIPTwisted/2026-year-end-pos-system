import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const tx = await prisma.intercompanyTransaction.findUnique({
    where: { id },
    include: {
      partner: true,
    },
  })
  if (!tx) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(tx)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json()

  const existing = await prisma.intercompanyTransaction.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = {}

  if (body.action === 'post') {
    if (existing.status !== 'pending')
      return NextResponse.json({ error: 'Only pending transactions can be posted' }, { status: 400 })
    data.status = 'posted'
  } else if (body.action === 'reconcile') {
    if (existing.status !== 'posted')
      return NextResponse.json({ error: 'Only posted transactions can be reconciled' }, { status: 400 })
    data.status = 'reconciled'
  } else if (body.action === 'eliminate') {
    data.isEliminated = true
  } else {
    if (body.description !== undefined) data.description = body.description
    if (body.documentNo !== undefined) data.documentNo = body.documentNo
    if (body.eliminationNeeded !== undefined) data.eliminationNeeded = body.eliminationNeeded
  }

  const tx = await prisma.intercompanyTransaction.update({
    where: { id },
    data,
    include: {
      partner: { select: { id: true, partnerCode: true, partnerName: true } },
    },
  })
  return NextResponse.json(tx)
}
