import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const serviceCase = await prisma.serviceCase.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
    })

    if (!serviceCase) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(serviceCase)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      status?: string
      priority?: string
      resolution?: string
      assignedToId?: string
      resolvedAt?: string | null
    }

    const { status, priority, resolution, assignedToId, resolvedAt } = body

    const updateData: Record<string, unknown> = {}
    if (status      !== undefined) updateData.status     = status
    if (priority    !== undefined) updateData.priority   = priority
    if (resolution  !== undefined) updateData.resolution = resolution
    if (assignedToId !== undefined) updateData.assignedTo = assignedToId
    if (resolvedAt  !== undefined) {
      updateData.resolvedAt = resolvedAt ? new Date(resolvedAt) : null
    }

    const updated = await prisma.serviceCase.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
