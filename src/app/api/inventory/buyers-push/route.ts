import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const pushes = await prisma.buyersPush.findMany({ include: { lines: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(pushes)
}

export async function POST(req: Request) {
  const body = await req.json()
  const num = `PUSH-${Date.now().toString().slice(-6)}`
  const p = await prisma.buyersPush.create({
    data: {
      pushNumber: num,
      name: body.name,
      season: body.season,
      lines: body.lines ? { create: body.lines } : undefined,
    },
    include: { lines: true },
  })
  return NextResponse.json(p, { status: 201 })
}
