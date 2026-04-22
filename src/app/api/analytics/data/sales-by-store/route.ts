import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { store: 'Main Street', revenue: 487200, transactions: 4280, avgTicket: 113.83, yoyGrowth: 12.4 },
    { store: 'Downtown Flagship', revenue: 612800, transactions: 5140, avgTicket: 119.22, yoyGrowth: 8.7 },
    { store: 'Westside Mall', revenue: 398400, transactions: 3920, avgTicket: 101.63, yoyGrowth: -2.1 },
    { store: 'Airport Terminal', revenue: 284600, transactions: 2640, avgTicket: 107.80, yoyGrowth: 18.3 },
    { store: 'Suburb East', revenue: 196300, transactions: 2080, avgTicket: 94.38, yoyGrowth: 5.6 },
  ])
}
