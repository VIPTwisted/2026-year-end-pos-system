import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; rid: string }> }) {
  try {
    const { rid } = await params
    const body = await req.json()
    const rule = await prisma.domRule.update({
      where: { id: rid },
      data: {
        ruleType: body.ruleType,
        name: body.name,
        priority: body.priority,
        parameters: typeof body.parameters === 'object' ? JSON.stringify(body.parameters) : body.parameters,
        isActive: body.isActive,
      },
    })
    return NextResponse.json(rule)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; rid: string }> }) {
  try {
    const { rid } = await params
    await prisma.domRule.delete({ where: { id: rid } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
