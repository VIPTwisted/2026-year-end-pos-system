import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const statement = await prisma.bankStatement.findUnique({
    where: { id },
    include: {
      bankAccount: true,
      lines: { orderBy: { transactionDate: 'asc' } },
    },
  })
  if (!statement) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(statement)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const statement = await prisma.bankStatement.update({
    where: { id },
    data: {
      status: body.status,
      reconciledAt: body.status === 'reconciled' ? new Date() : undefined,
    },
  })
  return NextResponse.json(statement)
}
