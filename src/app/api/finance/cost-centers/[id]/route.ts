import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const center = await prisma.finCostCenter.findUnique({ where: { id } })
    if (!center) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(center)
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
    const { name, department, manager, budget, isActive } = body as {
      name?: string
      department?: string
      manager?: string
      budget?: number
      isActive?: boolean
    }
    const center = await prisma.finCostCenter.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(department !== undefined && { department: department?.trim() ?? null }),
        ...(manager !== undefined && { manager: manager?.trim() ?? null }),
        ...(budget !== undefined && { budget }),
        ...(isActive !== undefined && { isActive }),
      },
    })
    return NextResponse.json(center)
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
    await prisma.finCostCenter.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
