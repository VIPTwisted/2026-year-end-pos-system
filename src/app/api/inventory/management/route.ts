export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    data: null,
    totalSkus: 2847,
    lowStock: 34,
    outOfStock: 8,
    inventoryValue: 4200000,
    turnsYtd: 6.8,
  })
}
