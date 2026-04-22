import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const trigger = req.nextUrl.searchParams.get('trigger')
  const scripts = await prisma.callCenterScript.findMany({
    where: trigger ? { trigger } : {},
    orderBy: [{ trigger: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json(scripts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const script = await prisma.callCenterScript.create({ data: body })
  return NextResponse.json(script, { status: 201 })
}
