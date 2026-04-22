import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    const contracts = await prisma.cRMServiceContract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(contracts)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const contract = await prisma.cRMServiceContract.create({ data: body })
    return NextResponse.json(contract, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
