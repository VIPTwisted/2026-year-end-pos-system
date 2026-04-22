import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reminder = await prisma.aRReminder.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(reminder)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await req.json()) as {
      status?: string
      notes?: string
      level?: number
      dueDate?: string
    }

    const allowedStatuses = ['draft', 'sent', 'paid', 'cancelled']
    if (
      body.status !== undefined &&
      !allowedStatuses.includes(body.status)
    ) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const updated = await prisma.aRReminder.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.status === 'sent' && { sentAt: new Date() }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.level !== undefined && { level: body.level }),
        ...(body.dueDate !== undefined && {
          dueDate: new Date(body.dueDate),
        }),
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
