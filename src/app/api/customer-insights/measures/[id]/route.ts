import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const measure = await prisma.cIMeasure.findUnique({ where: { id } })
  if (!measure) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(measure)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.cIMeasure.update({
    where: { id },
    data: {
      ...(body.measureName !== undefined && { measureName: body.measureName }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.measureType !== undefined && { measureType: body.measureType }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.formulaJson !== undefined && { formulaJson: body.formulaJson }),
      ...(body.currentValue !== undefined && { currentValue: body.currentValue }),
      ...(body.changePercent !== undefined && { changePercent: body.changePercent }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.refreshSchedule !== undefined && { refreshSchedule: body.refreshSchedule }),
    },
  })
  return NextResponse.json(updated)
}
