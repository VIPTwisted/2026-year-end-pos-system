import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateLoanerNo() {
  const year = new Date().getFullYear()
  const seq = Date.now().toString(36).toUpperCase().slice(-5)
  return `LNR-${year}-${seq}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const customerId = searchParams.get('customerId')

  const loaners = await prisma.serviceLoaner.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(customerId ? { lentToCustomerId: customerId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(loaners)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { description, itemNo, serialNo, status, lentToCustomerId, dateLent, dateReturned } = body

  if (!description) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 })
  }

  const loaner = await prisma.serviceLoaner.create({
    data: {
      loanerNo: generateLoanerNo(),
      description,
      itemNo: itemNo ?? null,
      serialNo: serialNo ?? null,
      status: status ?? 'Available',
      lentToCustomerId: lentToCustomerId ?? null,
      dateLent: dateLent ? new Date(dateLent) : null,
      dateReturned: dateReturned ? new Date(dateReturned) : null,
    },
  })

  return NextResponse.json(loaner, { status: 201 })
}
