import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const forecast = await prisma.salesForecast.findUnique({ where: { id } })
    if (!forecast) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(forecast)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch forecast' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const forecast = await prisma.salesForecast.update({ where: { id }, data: body })
    return NextResponse.json(forecast)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update forecast' }, { status: 500 })
  }
}
