import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ALL_ORDERS = [
  { orderNo: 'P-2026-0440', itemNo: 'A100', description: 'Widget Assembly', qtyPlanned: 1000, qtyReported: 1000, status: 'Ended', workCenter: 'Assembly A', startDate: 'Apr 1', endDate: 'Apr 10', route: 'RT-001' },
  { orderNo: 'P-2026-0441', itemNo: 'A100', description: 'Widget Assembly', qtyPlanned: 500, qtyReported: 320, status: 'Started', workCenter: 'Assembly A', startDate: 'Apr 18', endDate: 'Apr 23', route: 'RT-001' },
  { orderNo: 'P-2026-0442', itemNo: 'B200', description: 'Motor Housing', qtyPlanned: 150, qtyReported: 150, status: 'Reported', workCenter: 'Mach 1', startDate: 'Apr 20', endDate: 'Apr 22', route: 'RT-002' },
  { orderNo: 'P-2026-0443', itemNo: 'C300', description: 'Control Panel', qtyPlanned: 200, qtyReported: 80, status: 'Released', workCenter: 'Assembly B', startDate: 'Apr 19', endDate: 'Apr 24', route: 'RT-003' },
  { orderNo: 'P-2026-0444', itemNo: 'D400', description: 'Drive Unit', qtyPlanned: 75, qtyReported: 0, status: 'Created', workCenter: 'Welding', startDate: 'Apr 25', endDate: 'Apr 27', route: 'RT-004' },
  { orderNo: 'P-2026-0445', itemNo: 'E500', description: 'Frame Structure', qtyPlanned: 300, qtyReported: 295, status: 'Started', workCenter: 'Assembly A', startDate: 'Apr 18', endDate: 'Apr 23', route: 'RT-001' },
  { orderNo: 'P-2026-0446', itemNo: 'F600', description: 'Gear Assembly', qtyPlanned: 120, qtyReported: 60, status: 'Started', workCenter: 'Mach 2', startDate: 'Apr 20', endDate: 'Apr 24', route: 'RT-005' },
  { orderNo: 'P-2026-0447', itemNo: 'G700', description: 'Shaft Component', qtyPlanned: 400, qtyReported: 0, status: 'Created', workCenter: 'Welding', startDate: 'Apr 26', endDate: 'Apr 29', route: 'RT-004' },
  { orderNo: 'P-2026-0448', itemNo: 'H800', description: 'Housing Cover', qtyPlanned: 250, qtyReported: 250, status: 'Ended', workCenter: 'Paint Booth', startDate: 'Apr 15', endDate: 'Apr 22', route: 'RT-006' },
  { orderNo: 'P-2026-0449', itemNo: 'J900', description: 'Bearing Block', qtyPlanned: 180, qtyReported: 45, status: 'Released', workCenter: 'Mach 1', startDate: 'Apr 19', endDate: 'Apr 24', route: 'RT-002' },
  { orderNo: 'P-2026-0450', itemNo: 'K100', description: 'End Cap', qtyPlanned: 600, qtyReported: 420, status: 'Started', workCenter: 'Packaging', startDate: 'Apr 20', endDate: 'Apr 23', route: 'RT-007' },
  { orderNo: 'P-2026-0451', itemNo: 'L200', description: 'Valve Assembly', qtyPlanned: 90, qtyReported: 90, status: 'Reported', workCenter: 'Assembly B', startDate: 'Apr 17', endDate: 'Apr 21', route: 'RT-003' },
  { orderNo: 'P-2026-0452', itemNo: 'M300', description: 'Pump Housing', qtyPlanned: 50, qtyReported: 25, status: 'Released', workCenter: 'Mach 1', startDate: 'Apr 21', endDate: 'Apr 26', route: 'RT-002' },
  { orderNo: 'P-2026-0453', itemNo: 'N400', description: 'Flange Set', qtyPlanned: 800, qtyReported: 0, status: 'Created', workCenter: 'Welding', startDate: 'Apr 28', endDate: 'May 2', route: 'RT-004' },
  { orderNo: 'P-2026-0454', itemNo: 'P500', description: 'Cover Plate', qtyPlanned: 350, qtyReported: 350, status: 'Ended', workCenter: 'Paint Booth', startDate: 'Apr 10', endDate: 'Apr 18', route: 'RT-006' },
  { orderNo: 'P-2026-0455', itemNo: 'Q600', description: 'Actuator Body', qtyPlanned: 60, qtyReported: 30, status: 'Started', workCenter: 'Mach 2', startDate: 'Apr 22', endDate: 'Apr 25', route: 'RT-005' },
  { orderNo: 'P-2026-0456', itemNo: 'R700', description: 'Bracket Assembly', qtyPlanned: 1200, qtyReported: 600, status: 'Started', workCenter: 'Assembly A', startDate: 'Apr 19', endDate: 'Apr 26', route: 'RT-001' },
  { orderNo: 'P-2026-0457', itemNo: 'S800', description: 'Roller Unit', qtyPlanned: 100, qtyReported: 0, status: 'Released', workCenter: 'Packaging', startDate: 'Apr 24', endDate: 'Apr 28', route: 'RT-007' },
  { orderNo: 'P-2026-0458', itemNo: 'T900', description: 'Casing Shell', qtyPlanned: 200, qtyReported: 200, status: 'Reported', workCenter: 'Assembly B', startDate: 'Apr 14', endDate: 'Apr 20', route: 'RT-003' },
  { orderNo: 'P-2026-0459', itemNo: 'U100', description: 'Connector Block', qtyPlanned: 500, qtyReported: 0, status: 'Created', workCenter: 'Mach 2', startDate: 'Apr 30', endDate: 'May 5', route: 'RT-005' },
]

export async function GET() {
  return NextResponse.json({ orders: ALL_ORDERS, total: 94 })
}
