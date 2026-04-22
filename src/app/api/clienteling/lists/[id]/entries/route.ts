import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const entries = await prisma.clientelingEntry.findMany({
    where: { listId: id },
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const entry = await prisma.clientelingEntry.create({
    data: {
      listId: id,
      customerId: body.customerId || null,
      customerName: body.customerName,
      customerEmail: body.customerEmail || null,
      customerPhone: body.customerPhone || null,
      notes: body.notes || null,
      priority: body.priority || 'normal',
      status: 'pending',
    },
  })
  return NextResponse.json(entry, { status: 201 })
}
