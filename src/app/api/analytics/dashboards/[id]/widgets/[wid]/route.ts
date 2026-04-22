import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; wid: string }> }) {
  const { wid } = await params
  const body = await req.json()
  const widget = await prisma.dashboardWidget.update({
    where: { id: wid },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.widgetType !== undefined && { widgetType: body.widgetType }),
      ...(body.dataSource !== undefined && { dataSource: body.dataSource }),
      ...(body.config !== undefined && { config: body.config }),
      ...(body.position !== undefined && { position: body.position }),
      ...(body.width !== undefined && { width: body.width }),
    },
  })
  return NextResponse.json(widget)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; wid: string }> }) {
  const { wid } = await params
  await prisma.dashboardWidget.delete({ where: { id: wid } })
  return NextResponse.json({ ok: true })
}
