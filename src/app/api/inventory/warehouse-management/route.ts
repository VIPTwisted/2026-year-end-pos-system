import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const WORK_ORDERS = [
  { woNo: 'WO-4421', type: 'Pick',          item: 'Widget A100',     qty: 50,   fromLoc: 'BULK-02', toLoc: 'SHIP-A',  priority: 'High',   status: 'In Progress', worker: 'Maria S.' },
  { woNo: 'WO-4422', type: 'Put-away',      item: 'Motor B200',      qty: 20,   fromLoc: 'RECV-A',  toLoc: 'BULK-04', priority: 'Normal', status: 'Open',        worker: '—' },
  { woNo: 'WO-4423', type: 'Replenishment', item: 'Coffee Blend',    qty: 100,  fromLoc: 'BULK-06', toLoc: 'PICK-09', priority: 'Normal', status: 'Completed',   worker: 'James K.' },
  { woNo: 'WO-4424', type: 'Pick',          item: 'Control C300',    qty: 8,    fromLoc: 'PICK-03', toLoc: 'SHIP-B',  priority: 'High',   status: 'Open',        worker: '—' },
  { woNo: 'WO-4425', type: 'Transfer',      item: 'Drive Unit D400', qty: 15,   fromLoc: 'BULK-01', toLoc: 'BULK-05', priority: 'Low',    status: 'Open',        worker: '—' },
  { woNo: 'WO-4426', type: 'Pick',          item: 'T-Shirt White',   qty: 200,  fromLoc: 'PICK-11', toLoc: 'SHIP-A',  priority: 'High',   status: 'In Progress', worker: 'David L.' },
  { woNo: 'WO-4427', type: 'Replenishment', item: 'Bolt M8 x25',     qty: 5000, fromLoc: 'BULK-03', toLoc: 'PICK-01', priority: 'Normal', status: 'Open',        worker: '—' },
  { woNo: 'WO-4428', type: 'Cycle Count',   item: 'PICK-07 Zone',    qty: 1,    fromLoc: 'PICK-07', toLoc: 'PICK-07', priority: 'Low',    status: 'On Hold',     worker: 'Ana P.' },
  { woNo: 'WO-4429', type: 'Put-away',      item: 'LED Panel 24V',   qty: 40,   fromLoc: 'RECV-B',  toLoc: 'BULK-02', priority: 'Normal', status: 'In Progress', worker: 'Tom H.' },
  { woNo: 'WO-4430', type: 'Pick',          item: 'Display I900',    qty: 5,    fromLoc: 'PICK-04', toLoc: 'SHIP-B',  priority: 'High',   status: 'Completed',   worker: 'Maria S.' },
]

const INBOUND = [
  { poNo: 'PO-8812', vendor: 'IndusTech Mfg',     expectedDate: '2026-04-23', items: 3, status: 'In Transit' },
  { poNo: 'PO-8815', vendor: 'PrecisionParts Co',  expectedDate: '2026-04-24', items: 1, status: 'Scheduled' },
  { poNo: 'PO-8819', vendor: 'BeanSource LLC',      expectedDate: '2026-04-22', items: 2, status: 'Arrived'   },
  { poNo: 'PO-8821', vendor: 'SensorTech',          expectedDate: '2026-04-25', items: 4, status: 'Receiving' },
  { poNo: 'PO-8823', vendor: 'MetalWorks Co',       expectedDate: '2026-04-26', items: 2, status: 'Scheduled' },
]

const OUTBOUND = [
  { soNo: 'SO-2241', customer: 'Acme Corp',        shipDate: '2026-04-22', lines: 5,  status: 'Staged'  },
  { soNo: 'SO-2245', customer: 'TechRetail LLC',   shipDate: '2026-04-22', lines: 12, status: 'Picking' },
  { soNo: 'SO-2248', customer: 'Global Dist Inc',  shipDate: '2026-04-23', lines: 8,  status: 'Packed'  },
  { soNo: 'SO-2250', customer: 'ShopNow Co',       shipDate: '2026-04-23', lines: 3,  status: 'Pending' },
  { soNo: 'SO-2252', customer: 'BulkBuy Partners', shipDate: '2026-04-24', lines: 20, status: 'Picking' },
]

const KPI = {
  warehouseUtilization: 72,
  pendingReceipts: 8,
  pendingShipments: 14,
  openWorkOrders: 23,
  pickAccuracy: 99.2,
}

export async function GET() {
  return NextResponse.json({
    kpi: KPI,
    workOrders: WORK_ORDERS,
    inbound: INBOUND,
    outbound: OUTBOUND,
  })
}
