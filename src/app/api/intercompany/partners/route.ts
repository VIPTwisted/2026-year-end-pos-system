import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const partners = await prisma.intercompanyPartner.findMany({
    orderBy: { partnerCode: 'asc' },
    include: {
      _count: { select: { transactions: true } },
    },
  })
  return NextResponse.json(partners)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.partnerCode || !body.partnerName) {
    return NextResponse.json(
      { error: 'partnerCode and partnerName are required' },
      { status: 400 },
    )
  }
  const partner = await prisma.intercompanyPartner.create({
    data: {
      partnerCode: body.partnerCode.trim().toUpperCase(),
      partnerName: body.partnerName.trim(),
      partnerType: body.partnerType || 'subsidiary',
      currency: body.currency || 'USD',
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(partner, { status: 201 })
}
