import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const exp = await prisma.cIExport.findUnique({ where: { id } })
  if (!exp) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(exp)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.cIExport.update({
    where: { id },
    data: {
      ...(body.exportName !== undefined && { exportName: body.exportName }),
      ...(body.destination !== undefined && { destination: body.destination }),
      ...(body.destinationType !== undefined && { destinationType: body.destinationType }),
      ...(body.segmentId !== undefined && { segmentId: body.segmentId }),
      ...(body.segmentName !== undefined && { segmentName: body.segmentName }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.recordsExported !== undefined && { recordsExported: body.recordsExported }),
      ...(body.configJson !== undefined && { configJson: body.configJson }),
      ...(body.scheduleJson !== undefined && { scheduleJson: body.scheduleJson }),
    },
  })
  return NextResponse.json(updated)
}
