import { NextRequest, NextResponse } from 'next/server'

// MRP Worksheet lines — in a full implementation backed by Prisma
// For now: structured mock until schema supports planning tables

const MOCK_LINES = [
  { id: '1', worksheetName: 'DEFAULT', itemNo: 'ITEM-1001', description: 'Widget Assembly A', actionMessage: 'New', refOrderType: 'Prod. Order', refOrderNo: '', dueDate: '2026-05-01', qty: 150, location: 'MAIN' },
  { id: '2', worksheetName: 'DEFAULT', itemNo: 'ITEM-1002', description: 'Component B', actionMessage: 'Change Qty', refOrderType: 'Purchase', refOrderNo: 'PUR-2026-0088', dueDate: '2026-04-28', qty: 500, location: 'MAIN' },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const worksheetName = searchParams.get('worksheetName') ?? ''
    const actionMessage = searchParams.get('actionMessage') ?? ''

    let lines = MOCK_LINES
    if (worksheetName) lines = lines.filter(l => l.worksheetName === worksheetName)
    if (actionMessage) lines = lines.filter(l => l.actionMessage === actionMessage)

    return NextResponse.json({ lines, total: lines.length })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch MRP lines' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    if (action === 'calculatePlan') {
      // Trigger MRP calculation logic
      return NextResponse.json({ message: 'MRP plan calculation queued', linesGenerated: MOCK_LINES.length })
    }

    if (action === 'carryOut') {
      const { lineIds } = body
      if (!lineIds || !Array.isArray(lineIds)) {
        return NextResponse.json({ error: 'lineIds array required for carryOut' }, { status: 400 })
      }
      return NextResponse.json({ message: `${lineIds.length} action messages carried out`, ordersCreated: lineIds.length })
    }

    return NextResponse.json({ error: 'Unknown action. Use calculatePlan or carryOut.' }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to process MRP action' }, { status: 500 })
  }
}
