import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = Promise<{ id: string }>

export async function GET(
  _req: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { id } = await params

    const shift = await prisma.shift.findUnique({
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
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }

    return NextResponse.json(shift)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      checkOut?: string
      date?: string
      notes?: string
      status?: string
    }

    const existing = await prisma.shift.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }

    // Build update data
    type ShiftUpdate = {
      endTime?: Date
      status?: string
      notes?: string | null
    }
    const updateData: ShiftUpdate = {}

    if (body.checkOut) {
      // Use the date portion from startTime, combine with new checkOut time
      const datePart = existing.startTime.toISOString().split('T')[0]
      updateData.endTime = new Date(`${datePart}T${body.checkOut}`)
      updateData.status = 'completed'
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    if (body.status) {
      updateData.status = body.status
    }

    const updated = await prisma.shift.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
