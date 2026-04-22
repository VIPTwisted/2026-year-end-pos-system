import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Create invoice from uninvoiced billable ledger entries
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { dueDate, notes } = body

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        ledgerEntries: { where: { isBillable: true, isInvoiced: false } },
      },
    })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const billable = project.ledgerEntries
    if (billable.length === 0) {
      return NextResponse.json({ error: 'No uninvoiced billable entries' }, { status: 400 })
    }

    const amount = billable.reduce((s: any, e: any) => s + Number(e.totalPrice), 0)

    // Auto-number: INV-PROJ-YYYY-NNNN
    const year = new Date().getFullYear()
    const prefix = `INV-PROJ-${year}-`
    const last = await prisma.projectInvoice.findFirst({
      where: { invoiceNo: { startsWith: prefix } },
      orderBy: { invoiceNo: 'desc' },
    })
    const seq = last ? parseInt(last.invoiceNo.slice(prefix.length)) + 1 : 1
    const invoiceNo = `${prefix}${String(seq).padStart(4, '0')}`

    const [invoice] = await prisma.$transaction([
      prisma.projectInvoice.create({
        data: {
          invoiceNo,
          projectId: id,
          dueDate: dueDate ? new Date(dueDate) : null,
          amount,
          notes: notes?.trim() || null,
          status: 'draft',
        },
      }),
      prisma.projectEntry.updateMany({
        where: {
          projectId: id,
          isBillable: true,
          isInvoiced: false,
        },
        data: { isInvoiced: true },
      }),
    ])

    return NextResponse.json(invoice, { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Invoice creation failed' }, { status: 500 })
  }
}
