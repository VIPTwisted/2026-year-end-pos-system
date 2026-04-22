import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const programs = await prisma.affiliateProgram.findMany({
    where: status ? { status } : undefined,
    include: {
      _count: { select: { affiliates: true, tiers: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(programs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const program = await prisma.affiliateProgram.create({ data: body })
  return NextResponse.json(program, { status: 201 })
}
