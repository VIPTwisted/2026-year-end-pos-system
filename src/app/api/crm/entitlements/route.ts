import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    const entitlements = await prisma.cRMEntitlement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(entitlements)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const entitlement = await prisma.cRMEntitlement.create({ data: body })
    return NextResponse.json(entitlement, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
