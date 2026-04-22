import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const salesperson = await prisma.salesperson.findUnique({
      where: { id },
      include: {
        territory: true,
        employee: { select: { id: true, firstName: true, lastName: true, position: true } },
        customers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            totalSpent: true,
            isActive: true,
          },
          orderBy: { lastName: 'asc' },
        },
      },
    })
    if (!salesperson) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(salesperson)
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
    const body = await req.json()

    const salesperson = await prisma.salesperson.update({
      where: { id },
      data: body,
      include: {
        territory: { select: { id: true, code: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    })
    return NextResponse.json(salesperson)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.salesperson.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
