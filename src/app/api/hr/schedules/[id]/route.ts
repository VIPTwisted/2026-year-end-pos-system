import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const shift = await prisma.scheduledShift.findUnique({
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
    if (!shift) {
      return NextResponse.json({ error: 'Scheduled shift not found' }, { status: 404 })
    }
    return NextResponse.json(shift)
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
      status?: string
      startTime?: string
      endTime?: string
      notes?: string
    }

    const shift = await prisma.scheduledShift.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.startTime !== undefined && { startTime: body.startTime }),
        ...(body.endTime !== undefined && { endTime: body.endTime }),
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

    return NextResponse.json(shift)
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
    await prisma.scheduledShift.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
