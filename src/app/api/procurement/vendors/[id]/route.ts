export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

const VENDOR = {
  id: 'V10000',
  vendorNo: 'V10000',
  name: 'Acme Office Supplies',
  group: 'Office Supplies',
  paymentTerms: 'Net 30',
  currency: 'USD',
  balance: 4230.00,
  contactName: 'Mike Torres',
  contactPhone: '+1 555 0300',
  contactEmail: 'm.torres@acme.com',
  buyer: 'Mike Johnson',
  address: '123 Supply Drive',
  city: 'Chicago IL 60602',
  website: 'acme.com',
  leadTimeDays: 5,
  minOrderAmt: 100,
  taxStatus: 'Taxable',
  taxId: '98-7654321',
  w9Status: 'On File',
  insuranceStatus: 'Current',
  ytdPurchases: 28420,
  lastYearPurchases: 24180,
  threeYearAvg: 22410,
  onTimeDeliveryRate: 94.2,
  qualityRating: 4.6,
  priceCompetitiveness: 3.8,
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ vendor: { ...VENDOR, id: params.id } })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  return NextResponse.json({ vendor: { ...VENDOR, ...body, id: params.id } })
}
