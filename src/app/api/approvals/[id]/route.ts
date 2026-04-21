import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const request = await prisma.approvalRequest.findUnique({
      where: { id },
      include: {
        workflow: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
        actions: { orderBy: { createdAt: 'asc' } },
      },
    })
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(request)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch approval request' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, notes, currentStep } = body

    const data: Record<string, unknown> = {}
    if (status !== undefined) data.status = status
    if (notes !== undefined) data.notes = notes
    if (currentStep !== undefined) data.currentStep = currentStep

    const updated = await prisma.approvalRequest.update({
      where: { id },
      data,
      include: {
        workflow: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
        actions: { orderBy: { createdAt: 'asc' } },
      },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update approval request' }, { status: 500 })
  }
}
