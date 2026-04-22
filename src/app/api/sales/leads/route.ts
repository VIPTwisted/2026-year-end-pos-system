import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const where = status && status !== 'all' ? { status } : {}
    const leads = await prisma.salesLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(leads)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const lead = await prisma.salesLead.create({ data: body })
    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
