import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const values = await prisma.finDimensionValue.findMany({
      where: { dimensionId: id },
      orderBy: { code: 'asc' },
    })
    return NextResponse.json(values)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { code, name } = body as { code: string; name: string }
    if (!code?.trim() || !name?.trim()) {
      return NextResponse.json({ error: 'code and name are required' }, { status: 400 })
    }
    const value = await prisma.finDimensionValue.create({
      data: {
        dimensionId: id,
        code: code.trim().toUpperCase(),
        name: name.trim(),
      },
    })
    return NextResponse.json(value, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dimensionId } = await params
    const { valueId } = (await req.json()) as { valueId: string }
    if (!valueId) {
      return NextResponse.json({ error: 'valueId is required' }, { status: 400 })
    }
    await prisma.finDimensionValue.deleteMany({
      where: { id: valueId, dimensionId },
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
