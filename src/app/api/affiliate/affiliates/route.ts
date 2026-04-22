import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateCode(firstName: string): string {
  const prefix = (firstName || 'AFF').slice(0, 3).toUpperCase()
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${digits}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const programId = searchParams.get('programId')
  const tierId = searchParams.get('tierId')
  const sponsorId = searchParams.get('sponsorId')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const affiliates = await prisma.affiliate.findMany({
    where: {
      ...(programId ? { programId } : {}),
      ...(tierId ? { tierId } : {}),
      ...(sponsorId ? { sponsorId } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
              { affiliateCode: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      program: { select: { name: true } },
      _count: { select: { referrals: true } },
    },
    orderBy: { totalSales: 'desc' },
  })
  return NextResponse.json(affiliates)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  let code = generateCode(body.firstName)
  let exists = await prisma.affiliate.findUnique({ where: { affiliateCode: code } })
  while (exists) {
    code = generateCode(body.firstName)
    exists = await prisma.affiliate.findUnique({ where: { affiliateCode: code } })
  }
  const affiliate = await prisma.affiliate.create({
    data: { ...body, affiliateCode: code },
  })
  return NextResponse.json(affiliate, { status: 201 })
}
