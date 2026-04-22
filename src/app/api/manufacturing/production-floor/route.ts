import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = {
    kpis: {
      activeOrders: 14,
      onSchedule: 11,
      delayed: 3,
      oeePct: 84.2,
      unitsProduced: 2847,
    },
    workCenters: [
      { name: 'Assembly Line A', utilization: 92 },
      { name: 'Assembly Line B', utilization: 78 },
      { name: 'Machining Center 1', utilization: 85 },
      { name: 'Machining Center 2', utilization: 67 },
      { name: 'Welding Station', utilization: 71 },
      { name: 'Paint Booth', utilization: 45 },
      { name: 'Quality Control', utilization: 88 },
      { name: 'Packaging', utilization: 63 },
    ],
    oee: {
      availability: 91,
      performance: 87,
      quality: 97,
      overall: 84.2,
    },
    qualityAlerts: [
      { id: 1, severity: 'amber', message: 'Defect rate on P-0443 elevated — 4.2% vs 2% target', order: 'P-2026-0443' },
      { id: 2, severity: 'amber', message: 'Rework required P-0441 batch 3 — 12 units flagged', order: 'P-2026-0441' },
      { id: 3, severity: 'red', message: 'Material shortage warning P-0447 — steel sheet stock < 10%', order: 'P-2026-0447' },
    ],
    productionOrders: [
      { id: 'P-2026-0441', item: 'Widget Assembly A100', qtyPlanned: 500, qtyDone: 320, status: 'In Progress', workCenter: 'Assembly A', due: 'Apr 23' },
      { id: 'P-2026-0442', item: 'Motor Housing B200', qtyPlanned: 150, qtyDone: 150, status: 'Completed', workCenter: 'Machining 1', due: 'Apr 22' },
      { id: 'P-2026-0443', item: 'Control Panel C300', qtyPlanned: 200, qtyDone: 80, status: 'Delayed', workCenter: 'Assembly B', due: 'Apr 21' },
      { id: 'P-2026-0444', item: 'Drive Unit D400', qtyPlanned: 75, qtyDone: 0, status: 'Planned', workCenter: 'Welding', due: 'Apr 25' },
      { id: 'P-2026-0445', item: 'Frame Structure E500', qtyPlanned: 300, qtyDone: 295, status: 'In Progress', workCenter: 'Assembly A', due: 'Apr 23' },
      { id: 'P-2026-0446', item: 'Gear Assembly F600', qtyPlanned: 120, qtyDone: 60, status: 'In Progress', workCenter: 'Machining 2', due: 'Apr 24' },
      { id: 'P-2026-0447', item: 'Shaft Component G700', qtyPlanned: 400, qtyDone: 0, status: 'Planned', workCenter: 'Welding', due: 'Apr 26' },
      { id: 'P-2026-0448', item: 'Housing Cover H800', qtyPlanned: 250, qtyDone: 250, status: 'Completed', workCenter: 'Paint Booth', due: 'Apr 22' },
      { id: 'P-2026-0449', item: 'Bearing Block J900', qtyPlanned: 180, qtyDone: 45, status: 'Delayed', workCenter: 'Machining 1', due: 'Apr 21' },
      { id: 'P-2026-0450', item: 'End Cap K100', qtyPlanned: 600, qtyDone: 420, status: 'In Progress', workCenter: 'Packaging', due: 'Apr 23' },
    ],
    ganttOrders: [
      { id: 'P-2026-0441', label: 'P-0441', startHour: 6, endHour: 18, color: '#6366f1' },
      { id: 'P-2026-0443', label: 'P-0443', startHour: 7, endHour: 14, color: '#ef4444' },
      { id: 'P-2026-0445', label: 'P-0445', startHour: 8, endHour: 20, color: '#6366f1' },
      { id: 'P-2026-0446', label: 'P-0446', startHour: 9, endHour: 17, color: '#0891b2' },
      { id: 'P-2026-0450', label: 'P-0450', startHour: 12, endHour: 22, color: '#0891b2' },
    ],
  }
  return NextResponse.json(data)
}
