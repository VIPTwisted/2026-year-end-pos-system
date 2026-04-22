import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const script = await prisma.agentScript.findUnique({ where: { id: params.id } })
    if (!script) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const steps = await prisma.agentScriptStep.findMany({
      where: { scriptId: params.id },
      orderBy: { stepNo: 'asc' },
    })
    return NextResponse.json({ ...script, steps })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { steps, ...data } = body
    const script = await prisma.agentScript.update({
      where: { id: params.id },
      data,
    })
    if (steps && Array.isArray(steps)) {
      await prisma.agentScriptStep.deleteMany({ where: { scriptId: params.id } })
      await prisma.agentScriptStep.createMany({
        data: steps.map((s: Record<string, unknown>) => ({ ...s, scriptId: params.id })),
      })
    }
    return NextResponse.json(script)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
