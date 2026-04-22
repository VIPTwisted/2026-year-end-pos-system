import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rules = await prisma.domRule.findMany({
      where: { profileId: id },
      orderBy: { priority: 'asc' },
    })
    return NextResponse.json(rules)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { ruleType, name, priority, parameters, isActive } = body

    if (!ruleType || !name) return NextResponse.json({ error: 'ruleType and name required' }, { status: 400 })

    const rule = await prisma.domRule.create({
      data: {
        profileId: id,
        ruleType,
        name,
        priority: priority ?? 0,
        parameters: typeof parameters === 'object' ? JSON.stringify(parameters) : (parameters ?? '{}'),
        isActive: isActive ?? true,
      },
    })
    return NextResponse.json(rule, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
