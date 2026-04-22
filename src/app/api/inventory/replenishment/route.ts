import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rules = await prisma.replenishmentRule.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(rules)
}

export async function POST(req: Request) {
  const body = await req.json()
  const r = await prisma.replenishmentRule.create({ data: body })
  return NextResponse.json(r, { status: 201 })
}
