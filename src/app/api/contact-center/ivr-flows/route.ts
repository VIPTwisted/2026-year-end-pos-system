import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const where = status ? { status } : {}
    const flows = await prisma.iVRFlow.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(flows)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const flow = await prisma.iVRFlow.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        phoneNumber: body.phoneNumber ?? null,
        status: body.status ?? 'draft',
        stepsJson: body.stepsJson ?? null,
      },
    })
    return NextResponse.json(flow, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
