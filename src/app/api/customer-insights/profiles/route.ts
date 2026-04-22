import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const take = 50
  const skip = parseInt(searchParams.get('skip') ?? '0', 10)
  const search = searchParams.get('search') ?? ''

  const where = search
    ? {
        OR: [
          { email: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
        ],
      }
    : undefined

  const [profiles, total] = await Promise.all([
    prisma.cICustomerProfile.findMany({ where, take, skip, orderBy: { createdAt: 'desc' } }),
    prisma.cICustomerProfile.count({ where }),
  ])
  return NextResponse.json({ profiles, total, take, skip })
}
