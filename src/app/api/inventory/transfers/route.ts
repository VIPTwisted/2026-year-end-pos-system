import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MOCK_TRANSFERS = [
  { id: '1', transferNo: 'TO-2026-0101', fromLocation: 'Main Warehouse', toLocation: 'Chicago Store', items: 8, totalQty: 240, status: 'In Transit', requestedBy: 'Mike Johnson', createdDate: 'Apr 18', expectedDelivery: 'Apr 24' },
  { id: '2', transferNo: 'TO-2026-0102', fromLocation: 'Main Warehouse', toLocation: 'New York Store', items: 5, totalQty: 120, status: 'Confirmed', requestedBy: 'Sarah Chen', createdDate: 'Apr 20', expectedDelivery: 'Apr 26' },
  { id: '3', transferNo: 'TO-2026-0103', fromLocation: 'Chicago Store', toLocation: 'LA Store', items: 3, totalQty: 45, status: 'Draft', requestedBy: 'Carlos M.', createdDate: 'Apr 21', expectedDelivery: 'Apr 28' },
  { id: '4', transferNo: 'TO-2026-0104', fromLocation: 'East Warehouse', toLocation: 'Dallas Store', items: 12, totalQty: 380, status: 'Received', requestedBy: 'Mike Johnson', createdDate: 'Apr 15', expectedDelivery: 'Apr 20' },
  { id: '5', transferNo: 'TO-2026-0105', fromLocation: 'Main Warehouse', toLocation: 'Miami Store', items: 6, totalQty: 200, status: 'Cancelled', requestedBy: 'Alice Chen', createdDate: 'Apr 10', expectedDelivery: '—' },
  { id: '6', transferNo: 'TO-2026-0106', fromLocation: 'East Warehouse', toLocation: 'Seattle Store', items: 4, totalQty: 160, status: 'In Transit', requestedBy: 'Tom Reed', createdDate: 'Apr 17', expectedDelivery: 'Apr 23' },
  { id: '7', transferNo: 'TO-2026-0107', fromLocation: 'Main Warehouse', toLocation: 'Dallas Store', items: 9, totalQty: 300, status: 'Confirmed', requestedBy: 'Sarah Chen', createdDate: 'Apr 19', expectedDelivery: 'Apr 25' },
  { id: '8', transferNo: 'TO-2026-0108', fromLocation: 'Chicago Store', toLocation: 'New York Store', items: 2, totalQty: 60, status: 'Draft', requestedBy: 'Alice Chen', createdDate: 'Apr 21', expectedDelivery: 'Apr 29' },
  { id: '9', transferNo: 'TO-2026-0109', fromLocation: 'Main Warehouse', toLocation: 'LA Store', items: 7, totalQty: 175, status: 'Received', requestedBy: 'Mike Johnson', createdDate: 'Apr 12', expectedDelivery: 'Apr 17' },
  { id: '10', transferNo: 'TO-2026-0110', fromLocation: 'East Warehouse', toLocation: 'Miami Store', items: 3, totalQty: 90, status: 'In Transit', requestedBy: 'Carlos M.', createdDate: 'Apr 16', expectedDelivery: 'Apr 22' },
  { id: '11', transferNo: 'TO-2026-0111', fromLocation: 'Main Warehouse', toLocation: 'Chicago Store', items: 5, totalQty: 140, status: 'Confirmed', requestedBy: 'Tom Reed', createdDate: 'Apr 20', expectedDelivery: 'Apr 27' },
  { id: '12', transferNo: 'TO-2026-0112', fromLocation: 'LA Store', toLocation: 'Seattle Store', items: 2, totalQty: 50, status: 'Draft', requestedBy: 'Sarah Chen', createdDate: 'Apr 21', expectedDelivery: 'Apr 30' },
  { id: '13', transferNo: 'TO-2026-0113', fromLocation: 'Dallas Store', toLocation: 'Main Warehouse', items: 6, totalQty: 220, status: 'Received', requestedBy: 'Alice Chen', createdDate: 'Apr 8', expectedDelivery: 'Apr 13' },
  { id: '14', transferNo: 'TO-2026-0114', fromLocation: 'East Warehouse', toLocation: 'New York Store', items: 10, totalQty: 400, status: 'Cancelled', requestedBy: 'Mike Johnson', createdDate: 'Apr 5', expectedDelivery: '—' },
  { id: '15', transferNo: 'TO-2026-0115', fromLocation: 'Main Warehouse', toLocation: 'East Warehouse', items: 1, totalQty: 25, status: 'In Transit', requestedBy: 'Carlos M.', createdDate: 'Apr 18', expectedDelivery: 'Apr 22' },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.toLowerCase()

    let results = [...MOCK_TRANSFERS]
    if (status && status !== 'All') results = results.filter(t => t.status === status)
    if (search) results = results.filter(t =>
      t.transferNo.toLowerCase().includes(search) ||
      t.fromLocation.toLowerCase().includes(search) ||
      t.toLocation.toLowerCase().includes(search) ||
      t.requestedBy.toLowerCase().includes(search)
    )
    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const newTransfer = {
      id: String(Date.now()),
      transferNo: `TO-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: 'Draft',
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...body,
    }
    return NextResponse.json(newTransfer, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    return NextResponse.json({ ...body, updatedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Failed to update transfer' }, { status: 500 })
  }
}
