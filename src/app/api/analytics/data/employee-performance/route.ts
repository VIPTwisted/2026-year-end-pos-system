import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { employeeName: 'Alex Rivera', transactions: 312, revenue: 41280, avgTicket: 132.31, itemsPerTransaction: 3.2 },
    { employeeName: 'Jordan Kim', transactions: 287, revenue: 38940, avgTicket: 135.68, itemsPerTransaction: 2.9 },
    { employeeName: 'Casey Morgan', transactions: 341, revenue: 35820, avgTicket: 105.04, itemsPerTransaction: 3.7 },
    { employeeName: 'Taylor Reyes', transactions: 298, revenue: 44310, avgTicket: 148.69, itemsPerTransaction: 2.6 },
    { employeeName: 'Drew Chen', transactions: 264, revenue: 29480, avgTicket: 111.67, itemsPerTransaction: 4.1 },
    { employeeName: 'Morgan Lee', transactions: 389, revenue: 51200, avgTicket: 131.62, itemsPerTransaction: 3.0 },
    { employeeName: 'Sam Walker', transactions: 211, revenue: 24680, avgTicket: 116.97, itemsPerTransaction: 2.8 },
    { employeeName: 'Jamie Torres', transactions: 356, revenue: 48920, avgTicket: 137.42, itemsPerTransaction: 3.4 },
  ])
}
