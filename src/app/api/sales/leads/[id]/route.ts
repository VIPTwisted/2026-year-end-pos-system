import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const lead = await prisma.salesLead.findUnique({ where: { id } })
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(lead)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const lead = await prisma.salesLead.update({ where: { id }, data: body })
    return NextResponse.json(lead)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}
