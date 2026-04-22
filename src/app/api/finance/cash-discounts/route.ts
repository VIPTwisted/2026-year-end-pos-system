import { NextRequest, NextResponse } from 'next/server'

// TODO: When a PaymentTerm model is added to the Prisma schema, replace this
// static data with prisma.paymentTerm.findMany() / prisma.paymentTerm.upsert()
// Schema stub for reference:
// model PaymentTerm {
//   id           String   @id @default(cuid())
//   code         String   @unique
//   description  String
//   discountPct  Float    @default(0)
//   discountDays Int      @default(0)
//   netDays      Int      @default(30)
//   isActive     Boolean  @default(true)
//   createdAt    DateTime @default(now())
//   updatedAt    DateTime @updatedAt
// }

export interface PaymentTerm {
  id: string
  code: string
  description: string
  discountPct: number   // e.g. 2 = 2%
  discountDays: number  // days within which discount applies
  netDays: number       // total days net payment due
  isActive: boolean
}

// In-memory store (reset on server restart) — replace with DB when PaymentTerm model added
const PAYMENT_TERMS: PaymentTerm[] = [
  { id: 'pt-1', code: 'NET30', description: 'Net 30 Days', discountPct: 0, discountDays: 0, netDays: 30, isActive: true },
  { id: 'pt-2', code: '2/10 NET30', description: '2% discount if paid within 10 days, net 30', discountPct: 2, discountDays: 10, netDays: 30, isActive: true },
  { id: 'pt-3', code: '1/15 NET45', description: '1% discount if paid within 15 days, net 45', discountPct: 1, discountDays: 15, netDays: 45, isActive: true },
  { id: 'pt-4', code: 'NET60', description: 'Net 60 Days', discountPct: 0, discountDays: 0, netDays: 60, isActive: true },
  { id: 'pt-5', code: 'COD', description: 'Cash On Delivery', discountPct: 0, discountDays: 0, netDays: 0, isActive: true },
  { id: 'pt-6', code: '3/5 NET20', description: '3% discount if paid within 5 days, net 20', discountPct: 3, discountDays: 5, netDays: 20, isActive: false },
]

export async function GET() {
  return NextResponse.json({ terms: PAYMENT_TERMS })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<PaymentTerm> & { id?: string }

    if (body.id) {
      // Update existing
      const idx = PAYMENT_TERMS.findIndex((t) => t.id === body.id)
      if (idx === -1) {
        return NextResponse.json({ error: 'Payment term not found' }, { status: 404 })
      }
      const updated: PaymentTerm = {
        ...PAYMENT_TERMS[idx],
        code: body.code ?? PAYMENT_TERMS[idx].code,
        description: body.description ?? PAYMENT_TERMS[idx].description,
        discountPct: body.discountPct ?? PAYMENT_TERMS[idx].discountPct,
        discountDays: body.discountDays ?? PAYMENT_TERMS[idx].discountDays,
        netDays: body.netDays ?? PAYMENT_TERMS[idx].netDays,
        isActive: body.isActive ?? PAYMENT_TERMS[idx].isActive,
      }
      PAYMENT_TERMS[idx] = updated
      return NextResponse.json({ term: updated })
    }

    // Create new
    if (!body.code || !body.description) {
      return NextResponse.json({ error: 'code and description are required' }, { status: 400 })
    }

    const newTerm: PaymentTerm = {
      id: `pt-${Date.now()}`,
      code: body.code,
      description: body.description,
      discountPct: body.discountPct ?? 0,
      discountDays: body.discountDays ?? 0,
      netDays: body.netDays ?? 30,
      isActive: body.isActive ?? true,
    }
    PAYMENT_TERMS.push(newTerm)
    return NextResponse.json({ term: newTerm }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/finance/cash-discounts]', err)
    return NextResponse.json({ error: 'Failed to save payment term' }, { status: 500 })
  }
}
