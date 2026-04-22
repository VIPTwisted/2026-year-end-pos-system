export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

const ITEM = {
  id: '1000',
  itemNo: '1000',
  description: 'Widget Assembly A100',
  itemGroup: 'Finished Goods',
  category: 'Finished Goods',
  status: 'Active',
  uom: 'EA',
  weight: 1.2,
  volume: 0.5,
  netWeight: 1.0,
  shelfLife: 'N/A',
  costMethod: 'Standard',
  standardCost: 22.00,
  lastDirectCost: 21.84,
  salesPrice: 34.99,
  margin: 37.1,
  onHand: 450,
  available: 320,
  onOrder: 200,
  preferredVendor: 'V10001 Fabrikam Electronics',
  leadTimeDays: 14,
  minOrderQty: 10,
  lastPurchasePrice: 21.84,
  lastVendor: 'Fabrikam Electronics',
  lastPoDate: 'Apr 8',
  priceList: 'Retail Standard 2026',
  reorderPoint: 100,
  safetyStock: 50,
  maxStock: 600,
  planningMethod: 'Reorder Point',
  reorderQty: 300,
  lotSize: 100,
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ item: { ...ITEM, id: params.id, itemNo: params.id } })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  return NextResponse.json({ item: { ...ITEM, ...body, id: params.id } })
}
