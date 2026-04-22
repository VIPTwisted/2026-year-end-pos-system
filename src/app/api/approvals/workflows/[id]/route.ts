import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const workflow = await prisma.approvalWorkflow.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { stepOrder: 'asc' } },
        _count: { select: { requests: true } },
      },
    })
    if (!workflow) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(workflow)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch workflow' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, entityType, description, isActive } = body

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (entityType !== undefined) data.entityType = entityType
    if (description !== undefined) data.description = description
    if (isActive !== undefined) data.isActive = isActive

    const workflow = await prisma.approvalWorkflow.update({
      where: { id },
      data,
      include: {
        steps: { orderBy: { stepOrder: 'asc' } },
        _count: { select: { requests: true } },
      },
    })
    return NextResponse.json(workflow)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Block deletion if there are pending requests
    const pendingCount = await prisma.approvalRequest.count({
      where: { workflowId: id, status: 'pending' },
    })
    if (pendingCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete workflow with ${pendingCount} pending request(s)` },
        { status: 409 }
      )
    }

    await prisma.approvalWorkflow.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 })
  }
}
