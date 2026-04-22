import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const today = new Date()
function daysFromToday(n: number) {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const RESERVATIONS = [
  { id: 'rsv-001', reservationNo: 'RSV-0001', resource: 'Conference Room B', customer: 'Acme Corp', from: daysFromToday(0), to: daysFromToday(0), status: 'Confirmed', amount: 450, notes: 'Q1 Strategy kickoff' },
  { id: 'rsv-002', reservationNo: 'RSV-0002', resource: 'Warehouse Bay A', customer: 'Global Imports LLC', from: daysFromToday(0), to: daysFromToday(3), status: 'In Use', amount: 1200, notes: 'Seasonal inventory overflow' },
  { id: 'rsv-003', reservationNo: 'RSV-0003', resource: 'CNC Mill #4', customer: 'PrecisionParts Co.', from: daysFromToday(0), to: daysFromToday(2), status: 'In Use', amount: 900, notes: 'Custom bracket run' },
  { id: 'rsv-004', reservationNo: 'RSV-0004', resource: 'Conference Room B', customer: 'TechVentures Inc.', from: daysFromToday(1), to: daysFromToday(1), status: 'Tentative', amount: 300, notes: 'Interview panel' },
  { id: 'rsv-005', reservationNo: 'RSV-0005', resource: 'Laser Cutter L2', customer: 'Artisan Metals', from: daysFromToday(2), to: daysFromToday(4), status: 'Confirmed', amount: 1750, notes: 'Signage fabrication batch' },
  { id: 'rsv-006', reservationNo: 'RSV-0006', resource: 'Warehouse Bay A', customer: 'RetailMax', from: daysFromToday(-5), to: daysFromToday(-1), status: 'Completed', amount: 2000, notes: 'Pre-season stock hold' },
  { id: 'rsv-007', reservationNo: 'RSV-0007', resource: 'CNC Mill #4', customer: 'AeroParts LLC', from: daysFromToday(5), to: daysFromToday(8), status: 'Confirmed', amount: 1800, notes: 'Prototype housing run' },
  { id: 'rsv-008', reservationNo: 'RSV-0008', resource: 'Conference Room B', customer: 'SalesForce Team', from: daysFromToday(-2), to: daysFromToday(-2), status: 'Cancelled', amount: 0, notes: 'Cancelled — reschedule pending' },
]

export async function GET() {
  return NextResponse.json(RESERVATIONS)
}
