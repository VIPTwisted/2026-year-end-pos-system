import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const reminder = await prisma.reminder.findUnique({
      where: { id },
      include: { lines: { orderBy: { lineNo: 'asc' } } },
    })
    if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ reminder })
  }

  const reminders = await prisma.reminder.findMany({
    orderBy: { createdAt: 'desc' },
    include: { lines: true },
  })
  return NextResponse.json({ reminders })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { lines, ...header } = body

  const reminder = await prisma.reminder.create({
    data: {
      customerNo: header.customerNo ?? null,
      customerName: header.customerName ?? null,
      reminderLevel: header.reminderLevel ?? 1,
      postingDate: new Date(header.postingDate),
      dueDate: header.dueDate ? new Date(header.dueDate) : null,
      amountLCY: header.amountLCY ?? 0,
      reminderFee: header.reminderFee ?? 0,
      status: header.status ?? 'Open',
      notes: header.notes ?? null,
      lines: lines?.length ? {
        create: lines.map((l: {
          lineNo: number
          documentType?: string
          documentNo?: string
          postingDate?: string
          dueDate?: string
          originalAmount?: number
          remainingAmount?: number
          interestAmount?: number
          description?: string
        }) => ({
          lineNo: l.lineNo,
          documentType: l.documentType ?? null,
          documentNo: l.documentNo ?? null,
          postingDate: l.postingDate ? new Date(l.postingDate) : null,
          dueDate: l.dueDate ? new Date(l.dueDate) : null,
          originalAmount: parseFloat(String(l.originalAmount)) || 0,
          remainingAmount: parseFloat(String(l.remainingAmount)) || 0,
          interestAmount: parseFloat(String(l.interestAmount)) || 0,
          description: l.description ?? null,
        })),
      } : undefined,
    },
    include: { lines: true },
  })
  return NextResponse.json({ reminder }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const body = await req.json()

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const reminder = await prisma.reminder.update({
    where: { id },
    data: {
      status: body.status,
      issuedAt: body.status === 'Issued' ? new Date() : undefined,
    },
  })
  return NextResponse.json({ reminder })
}
