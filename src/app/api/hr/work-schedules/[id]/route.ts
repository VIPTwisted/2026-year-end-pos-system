import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const schedule = await prisma.workSchedule.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
          },
        },
        store: {
          select: { id: true, name: true },
        },
      },
    })
    if (!schedule) {
      return NextResponse.json({ error: 'Work schedule not found' }, { status: 404 })
    }
    return NextResponse.json(schedule)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      startTime?: string
      endTime?: string
      isActive?: boolean
      effectiveTo?: string | null
      notes?: string | null
    }

    const schedule = await prisma.workSchedule.update({
      where: { id },
      data: {
        ...(body.startTime !== undefined && { startTime: body.startTime }),
        ...(body.endTime !== undefined && { endTime: body.endTime }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.effectiveTo !== undefined && {
          effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null,
        }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
        store: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(schedule)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await prisma.workSchedule.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
