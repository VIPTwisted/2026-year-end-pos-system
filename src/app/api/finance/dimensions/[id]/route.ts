import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const dimension = await prisma.finDimension.findUnique({
      where: { id },
      include: { values: { orderBy: { code: 'asc' } } },
    })
    if (!dimension) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(dimension)
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
    const { name, description, isBlocked } = body as {
      name?: string
      description?: string
      isBlocked?: boolean
    }
    const dimension = await prisma.finDimension.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() ?? null }),
        ...(isBlocked !== undefined && { isBlocked }),
      },
    })
    return NextResponse.json(dimension)
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
    const valueCount = await prisma.finDimensionValue.count({ where: { dimensionId: id } })
    if (valueCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete a dimension that has values. Remove all values first.' },
        { status: 409 }
      )
    }
    await prisma.finDimension.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
