import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const view = sp.get('view') ?? 'aging' // 'aging' | 'cases'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const invoices = await prisma.customerInvoice.findMany({
      where: { status: { in: ['posted', 'partial'] } },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    })

    type BucketKey = 'b0_30' | 'b31_60' | 'b61_90' | 'b91_120' | 'b120plus'

    interface AgingEntry {
      id: string
      invoiceNumber: string
      customerId: string
      customerName: string
      customerEmail: string | null
      dueDate: Date
      totalAmount: number
      paidAmount: number
      outstanding: number
      daysOverdue: number
      bucket: BucketKey
    }

    const rows: AgingEntry[] = invoices
      .map((inv) => {
        const outstanding = Math.max(0, inv.totalAmount - inv.paidAmount)
        const due = new Date(inv.dueDate)
        due.setHours(0, 0, 0, 0)
        const daysOverdue = Math.max(
          0,
          Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
        )
        let bucket: BucketKey = 'b0_30'
        if (daysOverdue > 120) bucket = 'b120plus'
        else if (daysOverdue > 90) bucket = 'b91_120'
        else if (daysOverdue > 60) bucket = 'b61_90'
        else if (daysOverdue > 30) bucket = 'b31_60'

        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerId: inv.customerId,
          customerName: `${inv.customer.firstName} ${inv.customer.lastName}`,
          customerEmail: inv.customer.email,
          dueDate: inv.dueDate,
          totalAmount: inv.totalAmount,
          paidAmount: inv.paidAmount,
          outstanding,
          daysOverdue,
          bucket,
        }
      })
      .filter((r) => r.outstanding > 0.005)

    const bucketSum = (b: BucketKey) =>
      rows.filter((r) => r.bucket === b).reduce((s, r) => s + r.outstanding, 0)

    const agingBuckets = {
      b0_30: { label: '0–30 Days', total: bucketSum('b0_30'), count: rows.filter((r) => r.bucket === 'b0_30').length },
      b31_60: { label: '31–60 Days', total: bucketSum('b31_60'), count: rows.filter((r) => r.bucket === 'b31_60').length },
      b61_90: { label: '61–90 Days', total: bucketSum('b61_90'), count: rows.filter((r) => r.bucket === 'b61_90').length },
      b91_120: { label: '91–120 Days', total: bucketSum('b91_120'), count: rows.filter((r) => r.bucket === 'b91_120').length },
      b120plus: { label: '120+ Days', total: bucketSum('b120plus'), count: rows.filter((r) => r.bucket === 'b120plus').length },
    }

    // Mock collection cases — in production these would be a DB model
    const mockCases = rows
      .filter((r) => r.daysOverdue > 30)
      .slice(0, 20)
      .map((r, i) => ({
        id: `case-${r.id}`,
        invoiceId: r.id,
        invoiceNumber: r.invoiceNumber,
        customerId: r.customerId,
        customerName: r.customerName,
        customerEmail: r.customerEmail,
        outstanding: r.outstanding,
        daysOverdue: r.daysOverdue,
        bucket: r.bucket,
        status: i % 4 === 0 ? 'promised' : i % 4 === 1 ? 'disputed' : i % 4 === 2 ? 'open' : 'open',
        collector: i % 2 === 0 ? 'Sarah M.' : 'James K.',
        nextActionDate: new Date(Date.now() + (i + 1) * 2 * 24 * 60 * 60 * 1000).toISOString(),
      }))

    if (view === 'cases') {
      return NextResponse.json({ cases: mockCases, agingBuckets })
    }

    return NextResponse.json({ rows, agingBuckets })
  } catch (err) {
    console.error('[GET /api/finance/collections]', err)
    return NextResponse.json({ error: 'Failed to load collections' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      action: 'send_reminder'
      invoiceId: string
      channel: 'email' | 'letter' | 'call'
      message?: string
    }

    if (body.action === 'send_reminder') {
      // In production: trigger email/letter/call workflow
      // For now: acknowledge and log
      console.log(`[Collections] Reminder sent via ${body.channel} for invoice ${body.invoiceId}`)
      return NextResponse.json({
        success: true,
        message: `Reminder queued via ${body.channel}`,
        invoiceId: body.invoiceId,
        sentAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('[POST /api/finance/collections]', err)
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 })
  }
}
