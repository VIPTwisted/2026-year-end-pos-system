import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// TODO: When a dedicated InterestRule model is added to the Prisma schema,
// replace this static data with prisma.interestRule.findMany()
export interface InterestRule {
  id: string
  code: string
  description: string
  graceDays: number
  interestRate: number   // percentage, e.g. 1.5 = 1.5%
  feePerDoc: number
  method: 'daily' | 'monthly'
  basis: 'outstanding' | 'original'
  isActive: boolean
}

const INTEREST_RULES: InterestRule[] = [
  { id: 'rule-1', code: 'STD-DAILY', description: 'Standard Daily Rate', graceDays: 5, interestRate: 0.05, feePerDoc: 0, method: 'daily', basis: 'outstanding', isActive: true },
  { id: 'rule-2', code: 'STD-MONTHLY', description: 'Standard Monthly Rate', graceDays: 0, interestRate: 1.5, feePerDoc: 25, method: 'monthly', basis: 'outstanding', isActive: true },
  { id: 'rule-3', code: 'PREMIUM', description: 'Premium Account Rate', graceDays: 10, interestRate: 0.03, feePerDoc: 0, method: 'daily', basis: 'original', isActive: true },
  { id: 'rule-4', code: 'LATE-FEE', description: 'Late Fee Only', graceDays: 30, interestRate: 0, feePerDoc: 50, method: 'monthly', basis: 'outstanding', isActive: true },
]

export async function GET() {
  return NextResponse.json({ rules: INTEREST_RULES })
}

interface CalculateBody {
  ruleId: string
  customerGroup?: string  // 'all' | specific group
  fromDate: string
  toDate: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CalculateBody
    const { ruleId, fromDate, toDate } = body

    const rule = INTEREST_RULES.find((r) => r.id === ruleId)
    if (!rule) {
      return NextResponse.json({ error: 'Interest rule not found' }, { status: 404 })
    }

    const from = new Date(fromDate)
    const to = new Date(toDate)

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
    }

    // Fetch overdue invoices in date range
    const invoices = await prisma.customerInvoice.findMany({
      where: {
        status: { in: ['posted', 'partial'] },
        dueDate: { lt: to },
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    })

    interface PreviewLine {
      customerId: string
      customerName: string
      invoiceId: string
      invoiceNumber: string
      dueDate: string
      outstanding: number
      daysOverdue: number
      interestAmount: number
      docFee: number
      totalCharge: number
    }

    const lines: PreviewLine[] = []
    let totalInterest = 0
    let totalFees = 0

    for (const inv of invoices) {
      const outstanding = Math.max(0, inv.totalAmount - inv.paidAmount)
      if (outstanding < 0.01) continue

      const due = new Date(inv.dueDate)
      const daysOverdue = Math.max(
        0,
        Math.floor((to.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
      )

      // Respect grace period
      if (daysOverdue <= rule.graceDays) continue

      const effectiveDays = daysOverdue - rule.graceDays
      const basis = rule.basis === 'outstanding' ? outstanding : inv.totalAmount

      let interestAmount = 0
      if (rule.method === 'daily') {
        interestAmount = basis * (rule.interestRate / 100) * effectiveDays
      } else {
        // monthly: round up to whole months
        const months = Math.ceil(effectiveDays / 30)
        interestAmount = basis * (rule.interestRate / 100) * months
      }

      const docFee = rule.feePerDoc
      const totalCharge = interestAmount + docFee

      totalInterest += interestAmount
      totalFees += docFee

      lines.push({
        customerId: inv.customerId,
        customerName: `${inv.customer.firstName} ${inv.customer.lastName}`,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        dueDate: inv.dueDate.toISOString(),
        outstanding,
        daysOverdue,
        interestAmount,
        docFee,
        totalCharge,
      })
    }

    lines.sort((a, b) => b.totalCharge - a.totalCharge)

    return NextResponse.json({
      preview: {
        rule,
        fromDate,
        toDate,
        lineCount: lines.length,
        totalInterest,
        totalFees,
        grandTotal: totalInterest + totalFees,
        lines,
      },
    })
  } catch (err) {
    console.error('[POST /api/finance/interest]', err)
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 })
  }
}
