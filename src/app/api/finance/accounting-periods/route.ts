import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fiscalYear = searchParams.get('fiscalYear')

  const periods = await prisma.accountingPeriod.findMany({
    where: fiscalYear
      ? {
          startingDate: {
            gte: new Date(`${fiscalYear}-01-01`),
            lte: new Date(`${fiscalYear}-12-31`),
          },
        }
      : undefined,
    orderBy: { startingDate: 'asc' },
  })

  return NextResponse.json(periods)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Support bulk creation of a fiscal year's periods
  if (body.action === 'create_year' && body.year) {
    const year = parseInt(body.year, 10)
    if (isNaN(year)) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }

    // Check if first period of year already exists
    const existingFirst = await prisma.accountingPeriod.findUnique({
      where: { startingDate: new Date(`${year}-01-01`) },
    })
    if (existingFirst) {
      return NextResponse.json({ error: `Accounting periods for ${year} already exist` }, { status: 409 })
    }

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]

    const created = await prisma.$transaction(
      months.map((name, i) =>
        prisma.accountingPeriod.create({
          data: {
            startingDate: new Date(year, i, 1),
            name: `${name} ${year}`,
            newFiscalYear: i === 0,
            closed: false,
            dateLocked: false,
            inventoryClosed: false,
          },
        })
      )
    )

    return NextResponse.json(created, { status: 201 })
  }

  // Single period creation
  if (!body.startingDate) {
    return NextResponse.json({ error: 'startingDate is required' }, { status: 400 })
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const period = await prisma.accountingPeriod.create({
    data: {
      startingDate:    new Date(body.startingDate),
      name:            body.name.trim(),
      newFiscalYear:   typeof body.newFiscalYear === 'boolean' ? body.newFiscalYear : false,
      closed:          typeof body.closed === 'boolean' ? body.closed : false,
      dateLocked:      typeof body.dateLocked === 'boolean' ? body.dateLocked : false,
      inventoryClosed: typeof body.inventoryClosed === 'boolean' ? body.inventoryClosed : false,
    },
  })

  return NextResponse.json(period, { status: 201 })
}
