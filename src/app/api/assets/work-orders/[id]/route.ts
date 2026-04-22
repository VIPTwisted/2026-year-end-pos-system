import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const wo = await prisma.maintenanceWorkOrder.findUnique({ where: { id } })
    if (!wo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(wo)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch work order' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const wo = await prisma.maintenanceWorkOrder.update({ where: { id }, data: body })
    return NextResponse.json(wo)
  } catch {
    return NextResponse.json({ error: 'Failed to update work order' }, { status: 500 })
  }
}
