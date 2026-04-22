export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    summary: {
      totalAssets: 247,
      totalBookValue: 18400000,
      acquisitionsYTD: 2100000,
      depreciationYTD: 1800000,
      disposalsYTD: 400000,
    },
    groups: [
      { name: 'Buildings', count: 45, bookValue: 8280000, pct: 45 },
      { name: 'Machinery', count: 68, bookValue: 5152000, pct: 28 },
      { name: 'Vehicles', count: 29, bookValue: 2208000, pct: 12 },
      { name: 'IT Equipment', count: 72, bookValue: 1840000, pct: 10 },
      { name: 'Furniture', count: 33, bookValue: 920000, pct: 5 },
    ],
    workspaceCounts: {
      all: 247,
      acquiredThisYear: 12,
      fullyDepreciated: 38,
      pendingDisposal: 4,
      underMaintenance: 7,
    },
  })
}
