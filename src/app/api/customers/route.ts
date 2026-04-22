import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') ?? ''

  const customers = await prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { lastName: 'asc' },
    take: 20,
  })
  return NextResponse.json(customers)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const customer = await prisma.customer.create({ data: body })
  return NextResponse.json(customer, { status: 201 })
}
