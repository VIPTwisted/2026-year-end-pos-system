import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const CUSTOMERS: Record<string, object> = {
  'C10000': {
    id: 'C10000',
    name: 'The Cannon Group PLC',
    accountType: 'Large Corp',
    creditStatus: 'OK',
    balance: 8432.10,
    creditLimit: 50000,
    contact: 'John Smith',
    phone: '+1 555 0100',
    email: 'john@cannon.com',
    salesRep: 'Alice Chen',
    address1: '192 Fisher Road',
    address2: 'Suite 400',
    city: 'Detroit',
    state: 'MI',
    zip: '48201',
    country: 'US',
    website: 'www.cannongroup.com',
    customerGroup: 'Large Corp',
    priceList: 'Corporate Q2 2026',
    paymentTerms: 'Net 30',
    paymentMethod: 'ACH Transfer',
    currency: 'USD',
    language: 'English',
    taxExempt: false,
    bankAccount: '****4521',
    ytdSales: 42380.00,
    lastYearSales: 38920.00,
    threeYearAvg: 36180.00,
    lastOrderDate: 'Apr 15, 2026',
    lastPaymentDate: 'Apr 10, 2026',
  },
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const customer = CUSTOMERS[id] ?? {
    id,
    name: `Customer ${id}`,
    accountType: 'Standard',
    creditStatus: 'OK',
    balance: 0,
    creditLimit: 10000,
    contact: 'N/A',
    phone: 'N/A',
    email: 'N/A',
    salesRep: 'Unassigned',
  }
  return NextResponse.json({ customer })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  return NextResponse.json({ customer: { id, ...body }, updated: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return NextResponse.json({ deleted: true, id })
}
