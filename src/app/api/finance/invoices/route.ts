import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const status = sp.get('status')
    const customerId = sp.get('customerId')

    const invoices = await prisma.customerInvoice.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { invoiceDate: 'desc' },
      take: 100,
    })

    return NextResponse.json({ invoices })
  } catch (err) {
    console.error('[GET /api/finance/invoices]', err)
    return NextResponse.json({ error: 'Failed to load invoices' }, { status: 500 })
  }
}

interface InvoiceLineInput {
  description: string
  quantity: number
  unitPrice: number
  accountId?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      customerId: string
      invoiceDate: string
      dueDate: string
      items: InvoiceLineInput[]
      notes?: string | null
    }

    const { customerId, invoiceDate, dueDate, items = [], notes } = body

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 })
    }

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`

    const subtotal = items.reduce(
      (sum, item) => sum + (item.quantity ?? 0) * (item.unitPrice ?? 0),
      0
    )
    const totalAmount = subtotal

    const invoice = await prisma.customerInvoice.create({
      data: {
        invoiceNumber,
        customerId,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal,
        taxAmount: 0,
        totalAmount,
        paidAmount: 0,
        status: 'draft',
        notes: notes ?? null,
        lines: {
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? 0,
            lineAmount: (item.quantity ?? 1) * (item.unitPrice ?? 0),
            taxAmount: 0,
            accountCode: item.accountId ?? null,
          })),
        },
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true },
        },
        lines: true,
      },
    })

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/finance/invoices]', err)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
