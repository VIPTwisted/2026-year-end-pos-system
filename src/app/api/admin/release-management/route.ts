import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const flags = await prisma.featureFlag.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(flags)
}

export async function POST(req: Request) {
  const body = await req.json()
  const flag = await prisma.featureFlag.create({ data: body })
  return NextResponse.json(flag, { status: 201 })
}
