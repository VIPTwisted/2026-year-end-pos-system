import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ROUTE_LIST = [
  { id: 'rtg001', routeNo: 'RTG-001', description: 'Assembly Standard',   item: 'Widget Assembly A100', status: 'Approved', effective: 'Jan 1, 2026', totalTime: 3.5, machineTime: 1.5, laborTime: 2.0 },
  { id: 'rtg002', routeNo: 'RTG-002', description: 'Machining Process',   item: 'Motor Housing B200',   status: 'Approved', effective: 'Mar 1, 2025', totalTime: 2.0, machineTime: 1.5, laborTime: 0.5 },
  { id: 'rtg003', routeNo: 'RTG-003', description: 'Quality Check Route', item: 'Control Panel C300',   status: 'Approved', effective: 'Jun 1, 2025', totalTime: 1.0, machineTime: 0.0, laborTime: 1.0 },
  { id: 'rtg004', routeNo: 'RTG-004', description: 'Packaging Line',      item: 'Circuit Board X400',   status: 'Draft',    effective: 'TBD',          totalTime: 0.5, machineTime: 0.0, laborTime: 0.5 },
]

const OPERATIONS = [
  { opNo: 10, operation: 'Receive Components', workCenter: 'RECV-WC',  setupTime: 0.25, runTime: 0.5,  queueTime: 0.5,  moveTime: 0.25, costCategory: 'Receiving', workers: 1, status: 'Active' },
  { opNo: 20, operation: 'Sub-Assembly Prep',  workCenter: 'ASSEM-B', setupTime: 0.5,  runTime: 0.75, queueTime: 0.25, moveTime: 0.25, costCategory: 'Assembly',  workers: 2, status: 'Active' },
  { opNo: 30, operation: 'Main Assembly',       workCenter: 'ASSEM-A', setupTime: 0.5,  runTime: 1.0,  queueTime: 0.5,  moveTime: 0.5,  costCategory: 'Assembly',  workers: 3, status: 'Active' },
  { opNo: 40, operation: 'Quality Inspection',  workCenter: 'QC-WC',   setupTime: 0.25, runTime: 0.25, queueTime: 0.25, moveTime: 0.25, costCategory: 'Quality',   workers: 1, status: 'Active' },
  { opNo: 50, operation: 'Rework (if needed)',  workCenter: 'ASSEM-B', setupTime: 0.5,  runTime: 0.5,  queueTime: 0,    moveTime: 0,    costCategory: 'Rework',    workers: 1, status: 'Conditional' },
  { opNo: 60, operation: 'Final Test',          workCenter: 'QC-WC',   setupTime: 0.1,  runTime: 0.25, queueTime: 0.25, moveTime: 0.25, costCategory: 'Quality',   workers: 1, status: 'Active' },
  { opNo: 70, operation: 'Packaging',           workCenter: 'PACK-WC', setupTime: 0.25, runTime: 0.5,  queueTime: 0.25, moveTime: 0.25, costCategory: 'Packaging', workers: 1, status: 'Active' },
  { opNo: 80, operation: 'Ship Staging',        workCenter: 'SHIP-WC', setupTime: 0.1,  runTime: 0.1,  queueTime: 0.5,  moveTime: 0,    costCategory: 'Shipping',  workers: 1, status: 'Active' },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const route = ROUTE_LIST.find(r => r.id === id)
    if (!route) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ route, operations: OPERATIONS })
  }

  return NextResponse.json({ data: ROUTE_LIST, total: ROUTE_LIST.length })
}
