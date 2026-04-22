import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const statements = await prisma.bankStatement.findMany({
    include: {
      bankAccount: true,
      _count: { select: { lines: true } },
    },
    orderBy: { statementDate: 'desc' },
  })
  return NextResponse.json(statements)
}

export async function POST(req: Request) {
  const body = await req.json()
  const statement = await prisma.bankStatement.create({
    data: {
      bankAccountId: body.bankAccountId,
      statementDate: new Date(body.statementDate),
      openingBalance: Number(body.openingBalance),
      closingBalance: Number(body.closingBalance),
    },
    include: { bankAccount: true },
  })
  return NextResponse.json(statement, { status: 201 })
}
