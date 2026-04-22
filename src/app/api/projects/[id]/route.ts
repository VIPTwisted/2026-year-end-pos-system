import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      customer: true,
      tasks: { orderBy: { sortOrder: 'asc' } },
      planningLines: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
        orderBy: { plannedDate: 'asc' },
      },
      ledgerEntries: { orderBy: { postingDate: 'desc' } },
      invoices: { orderBy: { invoiceDate: 'desc' } },
    },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { description, status, startDate, endDate, dueDate, contractAmount, budgetAmount, wipMethod, notes, customerId } = body

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(description !== undefined && { description: description.trim() }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(contractAmount !== undefined && { contractAmount: parseFloat(contractAmount) }),
        ...(budgetAmount !== undefined && { budgetAmount: parseFloat(budgetAmount) }),
        ...(wipMethod !== undefined && { wipMethod }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(customerId !== undefined && { customerId: customerId || null }),
      },
    })
    return NextResponse.json(project)
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
