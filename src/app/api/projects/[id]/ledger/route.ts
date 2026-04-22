import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const entries = await prisma.projectEntry.findMany({
    where: { projectId: id },
    orderBy: { postingDate: 'desc' },
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { taskId, entryType, description, quantity, unitPrice, unitCost, postingDate, documentNo, isBillable } = body

    if (!description?.trim() || !entryType) {
      return NextResponse.json({ error: 'Entry type and description required' }, { status: 400 })
    }

    const qty = parseFloat(quantity) || 1
    const price = parseFloat(unitPrice) || 0
    const cost = parseFloat(unitCost) || 0

    const entry = await prisma.projectEntry.create({
      data: {
        projectId: id,
        taskId: taskId || null,
        entryType,
        description: description.trim(),
        quantity: qty,
        unitPrice: price,
        totalCost: qty * cost,
        totalPrice: qty * price,
        postingDate: postingDate ? new Date(postingDate) : new Date(),
        isBillable: isBillable !== false,
      },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
