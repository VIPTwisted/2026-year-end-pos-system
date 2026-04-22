import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const periods = await prisma.fiscalPeriod.findMany({ orderBy: { period: 'desc' } })
    return NextResponse.json(periods)
  } catch (err) {
    console.error('[periods GET]', err)
    return NextResponse.json({ error: 'Failed to fetch periods' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { period, fiscalYear, status, notes } = body
    if (!period?.trim() || !fiscalYear?.trim()) {
      return NextResponse.json({ error: 'period and fiscalYear required' }, { status: 400 })
    }
    const fp = await prisma.fiscalPeriod.create({
      data: { period: period.trim(), fiscalYear: fiscalYear.trim(), status: status || 'open', notes: notes || null },
    })
    return NextResponse.json(fp, { status: 201 })
  } catch (err) {
    console.error('[periods POST]', err)
    return NextResponse.json({ error: 'Failed to create period' }, { status: 500 })
  }
}
