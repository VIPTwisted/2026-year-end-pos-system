import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rules = await prisma.callCenterFraudRule.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(rules)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const rule = await prisma.callCenterFraudRule.create({ data: body })
  return NextResponse.json(rule, { status: 201 })
}
