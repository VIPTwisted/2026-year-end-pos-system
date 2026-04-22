import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MOCK_SESSIONS = [
  { id: 'cc041', sessionNo: 'CC-2026-041', location: 'Main Warehouse Zone A', type: 'Zone Count', totalItems: 245, countedItems: 198, varianceItems: 12, status: 'In Progress', startedBy: 'Mike J.', date: 'Apr 22' },
  { id: 'cc040', sessionNo: 'CC-2026-040', location: 'Chicago Store', type: 'Full Store Count', totalItems: 847, countedItems: 847, varianceItems: 8, status: 'Pending Post', startedBy: 'Alice C.', date: 'Apr 20' },
  { id: 'cc039', sessionNo: 'CC-2026-039', location: 'East Warehouse', type: 'Spot Check', totalItems: 50, countedItems: 50, varianceItems: 0, status: 'Posted', startedBy: 'Sarah C.', date: 'Apr 18' },
]

const MOCK_LINES = [
  { itemNo: '1000', description: 'Widget Assembly A100', systemQty: 450, countedQty: 452, status: 'Counted' },
  { itemNo: '1001', description: 'Motor Housing B200', systemQty: 28, countedQty: 25, status: 'Variance' },
  { itemNo: '1002', description: 'Control Panel C300', systemQty: 0, countedQty: 2, status: 'Variance' },
  { itemNo: '1003', description: 'Power Cable 2m', systemQty: 120, countedQty: 120, status: 'Counted' },
  { itemNo: '1004', description: 'Standard Bolt M8 x100', systemQty: 12400, countedQty: 12400, status: 'Counted' },
  { itemNo: '1005', description: 'Air Filter H50', systemQty: 75, countedQty: 74, status: 'Variance' },
  { itemNo: '1006', description: 'Coffee Blend Premium', systemQty: 340, countedQty: null, status: 'Not Counted' },
  { itemNo: '1007', description: 'Temp Sensor T100', systemQty: 22, countedQty: 22, status: 'Counted' },
  { itemNo: '1008', description: 'Gate Valve G200', systemQty: 15, countedQty: 15, status: 'Counted' },
  { itemNo: '1009', description: 'Display Unit 21"', systemQty: 8, countedQty: 7, status: 'Variance' },
  { itemNo: '1010', description: 'Wireless Keyboard', systemQty: 44, countedQty: null, status: 'Not Counted' },
  { itemNo: '1011', description: 'Optical Mouse', systemQty: 56, countedQty: 56, status: 'Counted' },
  { itemNo: '1012', description: 'Vanilla Syrup 1L', systemQty: 200, countedQty: 198, status: 'Variance' },
  { itemNo: '1013', description: 'Paper Cup 12oz x50', systemQty: 88, countedQty: null, status: 'Not Counted' },
  { itemNo: '1014', description: 'Green Tea Organic', systemQty: 160, countedQty: 162, status: 'Counted' },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const status = searchParams.get('status')

    let sessions = [...MOCK_SESSIONS]
    if (status && status !== 'All') sessions = sessions.filter(s => s.status === status)

    const lines = sessionId ? MOCK_LINES : MOCK_LINES
    return NextResponse.json({ sessions, lines, sessionId: sessionId ?? MOCK_SESSIONS[0].id })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cycle count data' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const newSession = {
      id: String(Date.now()),
      sessionNo: `CC-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      status: 'In Progress',
      countedItems: 0,
      varianceItems: 0,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...body,
    }
    return NextResponse.json(newSession, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create count session' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    // POST adjustments — mark session as Posted
    return NextResponse.json({ ...body, status: 'Posted', postedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Failed to post adjustments' }, { status: 500 })
  }
}
