import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await prisma.savedReport.findUnique({ where: { id } })
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(report)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const report = await prisma.savedReport.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.reportType !== undefined && { reportType: body.reportType }),
      ...(body.config !== undefined && { config: body.config }),
      ...(body.isShared !== undefined && { isShared: body.isShared }),
      ...(body.schedule !== undefined && { schedule: body.schedule }),
    },
  })
  return NextResponse.json(report)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.savedReport.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
