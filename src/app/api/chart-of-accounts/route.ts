import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const accounts = await prisma.chartOfAccount.findMany({
    orderBy: { accountCode: 'asc' },
    include: {
      _count: { select: { glEntries: true } },
    },
  })
  return NextResponse.json(accounts)
}

export async function POST(req: Request) {
  const body = await req.json()
  const account = await prisma.chartOfAccount.create({
    data: {
      accountCode: body.accountCode,
      accountName: body.accountName,
      accountType: body.accountType,
      normalBalance: body.normalBalance ?? 'debit',
      parentCode: body.parentCode ?? null,
      description: body.description ?? null,
    },
  })
  return NextResponse.json(account, { status: 201 })
}
