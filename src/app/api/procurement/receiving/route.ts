import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MOCK_EXPECTED_POS = [
  { id: 'po1202', poNo: 'PO-2026-1202', vendor: 'Fabrikam Electronics', expectedDate: 'Apr 24', items: 5, expectedUnits: 120, status: 'Expected', buyer: 'Sarah Chen' },
  { id: 'po1203', poNo: 'PO-2026-1203', vendor: 'City Power & Light', expectedDate: 'Apr 30', items: 1, expectedUnits: null, status: 'Expected', buyer: 'Mike Johnson' },
  { id: 'po1206', poNo: 'PO-2026-1206', vendor: 'Global Imports LLC', expectedDate: 'Apr 23', items: 12, expectedUnits: 450, status: 'In Progress', buyer: 'Alice Brown' },
  { id: 'po1207', poNo: 'PO-2026-1207', vendor: 'Northwind Traders', expectedDate: 'Apr 25', items: 8, expectedUnits: 320, status: 'Expected', buyer: 'Carlos M.' },
  { id: 'po1208', poNo: 'PO-2026-1208', vendor: 'Wide World Importers', expectedDate: 'Apr 26', items: 3, expectedUnits: 75, status: 'Expected', buyer: 'Sarah Chen' },
  { id: 'po1209', poNo: 'PO-2026-1209', vendor: 'Adventure Works', expectedDate: 'Apr 27', items: 15, expectedUnits: 600, status: 'Expected', buyer: 'Tom Reed' },
  { id: 'po1210', poNo: 'PO-2026-1210', vendor: 'Contoso Supplies', expectedDate: 'Apr 29', items: 6, expectedUnits: 180, status: 'Expected', buyer: 'Mike Johnson' },
  { id: 'po1211', poNo: 'PO-2026-1211', vendor: 'Fabrikam Electronics', expectedDate: 'May 2', items: 4, expectedUnits: 96, status: 'Expected', buyer: 'Alice Brown' },
]

const MOCK_RECEIPT_HISTORY = [
  { id: 'rc1', receiptNo: 'RC-2026-0890', date: 'Apr 21', poNo: 'PO-2026-1200', vendor: 'Northwind Traders', items: 6, units: 240, totalCost: 8450.00, postedBy: 'Sarah Chen', status: 'Posted' },
  { id: 'rc2', receiptNo: 'RC-2026-0889', date: 'Apr 20', poNo: 'PO-2026-1198', vendor: 'Adventure Works', items: 3, units: 90, totalCost: 3200.00, postedBy: 'Tom Reed', status: 'Posted' },
  { id: 'rc3', receiptNo: 'RC-2026-0888', date: 'Apr 19', poNo: 'PO-2026-1195', vendor: 'Fabrikam Electronics', items: 8, units: 320, totalCost: 12750.00, postedBy: 'Alice Brown', status: 'Posted' },
  { id: 'rc4', receiptNo: 'RC-2026-0887', date: 'Apr 18', poNo: 'PO-2026-1192', vendor: 'Wide World Importers', items: 4, units: 160, totalCost: 5840.00, postedBy: 'Carlos M.', status: 'Posted' },
  { id: 'rc5', receiptNo: 'RC-2026-0886', date: 'Apr 17', poNo: 'PO-2026-1190', vendor: 'Contoso Supplies', items: 10, units: 450, totalCost: 18200.00, postedBy: 'Mike Johnson', status: 'Posted' },
  { id: 'rc6', receiptNo: 'RC-2026-0885', date: 'Apr 16', poNo: 'PO-2026-1188', vendor: 'Northwind Traders', items: 5, units: 200, totalCost: 7650.00, postedBy: 'Sarah Chen', status: 'Posted' },
  { id: 'rc7', receiptNo: 'RC-2026-0884', date: 'Apr 15', poNo: 'PO-2026-1185', vendor: 'Global Imports LLC', items: 7, units: 280, totalCost: 9900.00, postedBy: 'Alice Brown', status: 'Posted' },
  { id: 'rc8', receiptNo: 'RC-2026-0883', date: 'Apr 14', poNo: 'PO-2026-1182', vendor: 'Adventure Works', items: 2, units: 60, totalCost: 2450.00, postedBy: 'Tom Reed', status: 'Posted' },
  { id: 'rc9', receiptNo: 'RC-2026-0882', date: 'Apr 12', poNo: 'PO-2026-1180', vendor: 'Fabrikam Electronics', items: 9, units: 360, totalCost: 14300.00, postedBy: 'Mike Johnson', status: 'Posted' },
  { id: 'rc10', receiptNo: 'RC-2026-0881', date: 'Apr 11', poNo: 'PO-2026-1178', vendor: 'Contoso Supplies', items: 3, units: 120, totalCost: 4200.00, postedBy: 'Carlos M.', status: 'Voided' },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const vendor = searchParams.get('vendor')?.toLowerCase()

    let expectedPOs = [...MOCK_EXPECTED_POS]
    if (status && status !== 'All') expectedPOs = expectedPOs.filter(p => p.status === status)
    if (vendor) expectedPOs = expectedPOs.filter(p => p.vendor.toLowerCase().includes(vendor))

    return NextResponse.json({
      expectedPOs,
      receiptHistory: MOCK_RECEIPT_HISTORY,
      receiptLines: [],
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch receiving data' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const receiptNo = `RC-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`
    const newReceipt = {
      id: String(Date.now()),
      receiptNo,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: 'Posted',
      ...body,
    }
    return NextResponse.json(newReceipt, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to post receipt' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    return NextResponse.json({ ...body, updatedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Failed to update receipt' }, { status: 500 })
  }
}
