export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

const ADJUSTMENTS = [
  { id: '1', adjNum: 'ADJ-2026-0891', date: 'Apr 22', item: 'Widget A100', sku: '1000', location: 'Main WH', qtyAdj: 12, unitCost: 22.00, totalValue: 264.00, reason: 'Cycle Count', postedBy: 'Tom J.', status: 'Posted' },
  { id: '2', adjNum: 'ADJ-2026-0890', date: 'Apr 21', item: 'Motor B200', sku: '1001', location: 'Main WH', qtyAdj: -3, unitCost: 89.00, totalValue: -267.00, reason: 'Damaged', postedBy: 'Tom J.', status: 'Posted' },
  { id: '3', adjNum: 'ADJ-2026-0889', date: 'Apr 20', item: 'Coffee Blend', sku: '1006', location: 'Chicago', qtyAdj: 100, unitCost: 8.50, totalValue: 850.00, reason: 'Transfer Receipt', postedBy: 'Alice C.', status: 'Posted' },
  { id: '4', adjNum: 'ADJ-2026-0888', date: 'Apr 19', item: 'Control Panel', sku: '1002', location: 'Main WH', qtyAdj: -5, unitCost: 145.00, totalValue: -725.00, reason: 'Theft/Shrinkage', postedBy: 'Manager', status: 'Posted' },
  { id: '5', adjNum: 'ADJ-2026-0887', date: 'Apr 22', item: 'Bolt M8', sku: '1004', location: 'East WH', qtyAdj: 500, unitCost: 0.12, totalValue: 60.00, reason: 'Recount', postedBy: 'Tom J.', status: 'Draft' },
  { id: '6', adjNum: 'ADJ-2026-0886', date: 'Apr 18', item: 'Gasket Set', sku: '1010', location: 'Main WH', qtyAdj: -8, unitCost: 34.50, totalValue: -276.00, reason: 'Damaged', postedBy: 'Alice C.', status: 'Posted' },
  { id: '7', adjNum: 'ADJ-2026-0885', date: 'Apr 17', item: 'Drive Shaft', sku: '1011', location: 'East WH', qtyAdj: 2, unitCost: 210.00, totalValue: 420.00, reason: 'Receiving Error', postedBy: 'Tom J.', status: 'Reversed' },
  { id: '8', adjNum: 'ADJ-2026-0884', date: 'Apr 16', item: 'Filter Pack', sku: '1012', location: 'Chicago', qtyAdj: 24, unitCost: 6.75, totalValue: 162.00, reason: 'Cycle Count', postedBy: 'Alice C.', status: 'Posted' },
  { id: '9', adjNum: 'ADJ-2026-0883', date: 'Apr 15', item: 'Relay Switch', sku: '1013', location: 'Main WH', qtyAdj: -10, unitCost: 18.40, totalValue: -184.00, reason: 'System Error', postedBy: 'Manager', status: 'Posted' },
  { id: '10', adjNum: 'ADJ-2026-0882', date: 'Apr 14', item: 'Cable Bundle', sku: '1014', location: 'NY Store', qtyAdj: 50, unitCost: 4.20, totalValue: 210.00, reason: 'Transfer Receipt', postedBy: 'Tom J.', status: 'Posted' },
  { id: '11', adjNum: 'ADJ-2026-0881', date: 'Apr 13', item: 'Piston Ring', sku: '1015', location: 'Main WH', qtyAdj: -2, unitCost: 67.00, totalValue: -134.00, reason: 'Theft/Shrinkage', postedBy: 'Manager', status: 'Reversed' },
  { id: '12', adjNum: 'ADJ-2026-0880', date: 'Apr 12', item: 'Valve Core', sku: '1016', location: 'East WH', qtyAdj: 18, unitCost: 11.25, totalValue: 202.50, reason: 'Recount', postedBy: 'Alice C.', status: 'Posted' },
  { id: '13', adjNum: 'ADJ-2026-0879', date: 'Apr 11', item: 'Washer Set', sku: '1017', location: 'Chicago', qtyAdj: 200, unitCost: 0.08, totalValue: 16.00, reason: 'Cycle Count', postedBy: 'Tom J.', status: 'Draft' },
  { id: '14', adjNum: 'ADJ-2026-0878', date: 'Apr 10', item: 'Bearing 6203', sku: '1018', location: 'Main WH', qtyAdj: -6, unitCost: 28.90, totalValue: -173.40, reason: 'Damaged', postedBy: 'Alice C.', status: 'Posted' },
  { id: '15', adjNum: 'ADJ-2026-0877', date: 'Apr 9', item: 'Seal Kit', sku: '1019', location: 'NY Store', qtyAdj: 15, unitCost: 14.00, totalValue: 210.00, reason: 'Receiving Error', postedBy: 'Tom J.', status: 'Posted' },
]

export async function GET() {
  return NextResponse.json({ adjustments: ADJUSTMENTS, total: ADJUSTMENTS.length })
}

export async function POST(req: Request) {
  const body = await req.json()
  const newAdj = {
    id: String(Date.now()),
    adjNum: `ADJ-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    ...body,
    status: body.post ? 'Posted' : 'Draft',
  }
  return NextResponse.json({ adjustment: newAdj }, { status: 201 })
}
