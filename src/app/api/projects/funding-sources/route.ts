import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sources = await prisma.projectFundingSource.findMany({
      include: {
        project: { select: { id: true, projectNo: true, description: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(sources)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch funding sources' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const source = await prisma.projectFundingSource.create({ data: body })
    return NextResponse.json(source, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create funding source' }, { status: 500 })
  }
}
