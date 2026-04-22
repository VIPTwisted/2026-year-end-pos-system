import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // NumberSeries model exists as stub — query it; fallback gracefully
  try {
    const series = await (prisma as any).numberSeries.findMany({ orderBy: { createdAt: 'asc' } })
    return NextResponse.json(series)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  try {
    const series = await (prisma as any).numberSeries.create({ data: body })
    return NextResponse.json(series, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
