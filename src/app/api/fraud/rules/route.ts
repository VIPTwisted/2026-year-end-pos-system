import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rules = await prisma.fraudRule.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(rules)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch fraud rules' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, ruleType, threshold, action, isActive } = body

    if (!name || !ruleType) {
      return NextResponse.json({ error: 'name and ruleType are required' }, { status: 400 })
    }

    const rule = await prisma.fraudRule.create({
      data: {
        name: name.trim(),
        ruleType,
        threshold: threshold != null ? parseFloat(threshold) : undefined,
        action: action ?? 'flag',
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create fraud rule' }, { status: 500 })
  }
}
