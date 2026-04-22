import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const transfers = await prisma.outboundTransfer.findMany({
    where: status ? { status } : undefined,
    include: { lines: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(transfers)
}

export async function POST(req: Request) {
  const body = await req.json()
  const num = `TRF-${Date.now().toString().slice(-6)}`
  const t = await prisma.outboundTransfer.create({
    data: {
      transferNumber: num,
      fromLocation: body.fromLocation,
      toLocation: body.toLocation,
      priority: body.priority || 'normal',
      requestedBy: body.requestedBy,
      lines: body.lines ? { create: body.lines } : undefined,
    },
    include: { lines: true },
  })
  return NextResponse.json(t, { status: 201 })
}
