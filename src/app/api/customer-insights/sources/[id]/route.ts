import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const source = await prisma.cIDataSource.findUnique({ where: { id } })
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(source)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.cIDataSource.update({
    where: { id },
    data: {
      ...(body.sourceName !== undefined && { sourceName: body.sourceName }),
      ...(body.sourceType !== undefined && { sourceType: body.sourceType }),
      ...(body.connectionType !== undefined && { connectionType: body.connectionType }),
      ...(body.connectionInfo !== undefined && { connectionInfo: body.connectionInfo }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.entityName !== undefined && { entityName: body.entityName }),
      ...(body.refreshMode !== undefined && { refreshMode: body.refreshMode }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.recordCount !== undefined && { recordCount: body.recordCount }),
    },
  })
  return NextResponse.json(updated)
}
