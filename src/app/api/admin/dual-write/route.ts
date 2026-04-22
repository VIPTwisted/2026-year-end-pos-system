import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const mappings = await prisma.dualWriteMapping.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(mappings)
}

export async function POST(req: Request) {
  const body = await req.json()
  const mapping = await prisma.dualWriteMapping.create({ data: body })
  return NextResponse.json(mapping, { status: 201 })
}
