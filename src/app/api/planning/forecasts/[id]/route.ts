import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const model = await (prisma as any).forecastModel.findUnique({
      where: { id },
      include: { entries: { orderBy: { period: 'asc' } } },
    })
    if (!model) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(model)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const model = await (prisma as any).forecastModel.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.modelType !== undefined && { modelType: body.modelType }),
        ...(body.horizon !== undefined && { horizon: Number(body.horizon) }),
        ...(body.periodType !== undefined && { periodType: body.periodType }),
        ...(body.smoothingAlpha !== undefined && { smoothingAlpha: Number(body.smoothingAlpha) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })
    return NextResponse.json(model)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await (prisma as any).forecastModel.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
