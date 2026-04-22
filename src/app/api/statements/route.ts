import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function genStatementNo() {
  const year = new Date().getFullYear()
  const seq = Date.now().toString(36).toUpperCase().slice(-4)
  return `STMT-${year}-${seq}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('storeId')
  const status = searchParams.get('status')

  const statements = await prisma.retailStatement.findMany({
    where: {
      ...(storeId ? { storeId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      store: { select: { id: true, name: true } },
      _count: { select: { tenderLines: true } },
    },
    orderBy: { businessDate: 'desc' },
  })
  return NextResponse.json(statements)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const statement = await prisma.retailStatement.create({
    data: {
      ...body,
      statementNo: genStatementNo(),
    },
  })
  return NextResponse.json(statement, { status: 201 })
}
