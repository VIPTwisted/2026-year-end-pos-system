import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const where = status ? { isActive: status === 'active' } : {}
    const scripts = await prisma.agentScript.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(scripts)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const script = await prisma.agentScript.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        scriptType: body.scriptType ?? body.scenario ?? 'greeting',
        channel: body.channel ?? 'all',
        contentJson: body.contentJson ?? null,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(script, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
