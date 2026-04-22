export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    kpis: {
      itemsBelowReorderPoint: 34,
      pendingReplenishment: 42300,
      autoOrdersToday: 8,
      transferOrdersPending: 3,
      lastRulesRun: '6:00 AM',
    },
    alerts: [
      { id: 'a1', item: 'Widget A100', store: 'Chicago Store', onHand: 8, reorderPoint: 50, suggestedQty: 200, source: 'Main Warehouse', estCost: '$6,998', actions: ['po', 'transfer'] },
      { id: 'a2', item: 'Coffee Blend Premium', store: 'NY Store', onHand: 12, reorderPoint: 30, suggestedQty: 100, source: 'Vendor V10006', estCost: '$850', actions: ['po'] },
      { id: 'a3', item: 'Motor Housing B200', store: 'Main Warehouse', onHand: 5, reorderPoint: 25, suggestedQty: 50, source: 'Vendor V10001', estCost: '$4,450', actions: ['po'] },
    ],
    rules: [
      { id: 'r1', name: 'Rule-001', itemCategory: 'Finished Goods Category', location: 'All Stores', minQty: 50, maxQty: 500, reorderPoint: 75, leadTime: '14 days', method: 'Auto PO', active: true },
      { id: 'r2', name: 'Rule-002', itemCategory: 'Raw Materials', location: 'Main Warehouse', minQty: 100, maxQty: 2000, reorderPoint: 200, leadTime: '21 days', method: 'Auto PO', active: true },
    ],
    history: [
      { id: 'h1', orderNum: 'PO-2026-0441', type: 'PO', item: 'Widget A100', store: 'Main Warehouse', qty: 200, status: 'Received', created: 'Apr 8', received: 'Apr 15' },
    ],
  })
}
