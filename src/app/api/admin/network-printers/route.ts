import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const printers = await prisma.networkPrinter.findMany({
    include: { store: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(printers)
}

export async function POST(req: Request) {
  const body = await req.json()
  const printer = await prisma.networkPrinter.create({ data: body })
  return NextResponse.json(printer, { status: 201 })
}
