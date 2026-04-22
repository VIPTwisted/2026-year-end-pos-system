import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const modes = await prisma.deliveryMode.findMany({
    include: { pickupLocations: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(modes)
}

export async function POST(req: Request) {
  const body = await req.json()
  const mode = await prisma.deliveryMode.create({
    data: { code: body.code, name: body.name, modeType: body.modeType ?? 'shipping' },
  })
  return NextResponse.json(mode, { status: 201 })
}
