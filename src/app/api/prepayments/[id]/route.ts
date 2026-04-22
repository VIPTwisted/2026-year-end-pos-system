import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const prep = await prisma.payment.findUnique({
    where: { id },
    include: {
      customer: true,
      vendor: true,
    },
  })
  if (!prep) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(prep)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { action, appliedAmount, invoiceDate, notes, dueDate } = body

  const prep = await prisma.payment.findUnique({ where: { id } })
  if (!prep) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let newStatus = prep.status
  let newApplied = prep.appliedAmount

  if (action === 'invoice') {
    newStatus = 'invoiced'
  } else if (action === 'apply') {
    const addAmt = Number(appliedAmount) || 0
    newApplied = prep.appliedAmount + addAmt
    if (newApplied >= prep.amount) {
      newStatus = 'applied'
      newApplied = prep.amount
    }
  } else if (action === 'close') {
    newStatus = 'closed'
  }

  const updated = await prisma.payment.update({
    where: { id },
    data: {
      status: newStatus,
      appliedAmount: newApplied,
      ...(invoiceDate ? { invoiceDate: new Date(invoiceDate) } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
    },
    include: {
      customer: true,
      vendor: true,
    },
  })

  return NextResponse.json(updated)
}
