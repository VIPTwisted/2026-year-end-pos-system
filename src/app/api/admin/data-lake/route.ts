import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const exports = await prisma.dataLakeExport.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(exports)
}

export async function POST(req: Request) {
  const body = await req.json()
  const exp = await prisma.dataLakeExport.create({ data: body })
  return NextResponse.json(exp, { status: 201 })
}
