import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const widgets = await prisma.dashboardWidget.findMany({
    where: { dashboardId: id },
    orderBy: { position: 'asc' },
  })
  return NextResponse.json(widgets)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const count = await prisma.dashboardWidget.count({ where: { dashboardId: id } })
  const widget = await prisma.dashboardWidget.create({
    data: {
      dashboardId: id,
      widgetType: body.widgetType,
      title: body.title,
      dataSource: body.dataSource,
      config: body.config ?? '{}',
      position: body.position ?? count,
      width: body.width ?? '1/2',
    },
  })
  return NextResponse.json(widget, { status: 201 })
}
