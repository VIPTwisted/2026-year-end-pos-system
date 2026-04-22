import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const accountNo = searchParams.get('accountNo')
  const accountId = searchParams.get('accountId')
  const docType   = searchParams.get('docType')
  const dateFrom  = searchParams.get('dateFrom')
  const dateTo    = searchParams.get('dateTo')
  const search    = searchParams.get('search')
  const take      = parseInt(searchParams.get('take') ?? '200', 10)

  const where: Record<string, unknown> = {}

  if (accountNo) where.accountNo = { contains: accountNo }
  if (accountId) where.accountId = accountId
  if (docType) where.documentType = docType

  if (dateFrom || dateTo) {
    where.postingDate = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo   ? { lte: new Date(dateTo)   } : {}),
    }
  }

  if (search) {
    where.OR = [
      { documentNo:  { contains: search } },
      { description: { contains: search } },
      { accountNo:   { contains: search } },
    ]
  }

  const entries = await prisma.glEntry.findMany({
    where,
    orderBy: [{ postingDate: 'desc' }, { entryNo: 'desc' }],
    take: Math.min(take, 1000),
  })

  return NextResponse.json(entries)
}
