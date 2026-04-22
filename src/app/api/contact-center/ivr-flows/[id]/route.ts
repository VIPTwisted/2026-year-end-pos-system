import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const flow = await prisma.iVRFlow.findUnique({ where: { id: params.id } })
    if (!flow) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const nodes = await prisma.ivrFlowNode.findMany({
      where: { flowId: params.id },
      orderBy: { stepNo: 'asc' },
    })
    const runs = await prisma.iVRFlowRun.findMany({
      where: { flowId: params.id },
      orderBy: { startedAt: 'desc' },
      take: 200,
    })
    return NextResponse.json({ ...flow, nodes, runs })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const flow = await prisma.iVRFlow.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(flow)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.iVRFlow.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
