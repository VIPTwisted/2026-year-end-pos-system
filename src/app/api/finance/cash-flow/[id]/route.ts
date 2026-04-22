import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const forecast = await prisma.cashFlowForecast.findUnique({
    where: { id },
    include: { manualLines: { orderBy: { expectedDate: 'asc' } } },
  })
  if (!forecast) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(forecast)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, description, manualLinesUpsert, manualLinesDelete } = body

  if (manualLinesDelete && Array.isArray(manualLinesDelete) && manualLinesDelete.length > 0) {
    await prisma.cashFlowManualLine.deleteMany({
      where: { id: { in: manualLinesDelete }, forecastId: id },
    })
  }

  const forecast = await prisma.cashFlowForecast.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(manualLinesUpsert && Array.isArray(manualLinesUpsert) ? {
        manualLines: {
          upsert: (manualLinesUpsert as Array<{ id?: string; description: string; amount: number; expectedDate: string; category?: string; notes?: string }>).map(l => ({
            where: { id: l.id || 'new' },
            create: {
              description: l.description,
              amount: Number(l.amount),
              expectedDate: new Date(l.expectedDate),
              category: l.category || 'other',
              notes: l.notes || null,
            },
            update: {
              description: l.description,
              amount: Number(l.amount),
              expectedDate: new Date(l.expectedDate),
              category: l.category || 'other',
              notes: l.notes || null,
            },
          })),
        },
      } : {}),
    },
    include: { manualLines: { orderBy: { expectedDate: 'asc' } } },
  })

  return NextResponse.json(forecast)
}
