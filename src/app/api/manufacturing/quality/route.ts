import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const QUALITY_ORDERS = [
  { orderNo: 'QO-2026-0841', type: 'Inspection',    item: 'Widget A100',        productionOrder: 'P-2026-0441', qty: 50,  inspector: 'Tom J.',   status: 'In Progress', result: 'pending' },
  { orderNo: 'QO-2026-0840', type: 'Inspection',    item: 'Motor B200',         productionOrder: 'P-2026-0442', qty: 20,  inspector: 'Tom J.',   status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0839', type: 'Re-inspection', item: 'Control Panel C300', productionOrder: 'P-2026-0443', qty: 10,  inspector: 'Sarah K.', status: 'Failed',      result: 'fail'    },
  { orderNo: 'QO-2026-0838', type: 'Receiving',     item: 'Bolt M8 (PO-1205)', productionOrder: null,          qty: 500, inspector: 'Tom J.',   status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0837', type: 'Outgoing',      item: 'Widget A100',        productionOrder: 'P-2026-0440', qty: 100, inspector: 'Sarah K.', status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0836', type: 'Inspection',    item: 'Circuit Board X400', productionOrder: 'P-2026-0439', qty: 30,  inspector: 'Tom J.',   status: 'Open',        result: 'pending' },
  { orderNo: 'QO-2026-0835', type: 'Inspection',    item: 'Motor B200',         productionOrder: 'P-2026-0438', qty: 15,  inspector: 'Sarah K.', status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0834', type: 'Re-inspection', item: 'Widget A100',        productionOrder: 'P-2026-0437', qty: 5,   inspector: 'Tom J.',   status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0833', type: 'Receiving',     item: 'Steel Frame Insert', productionOrder: null,          qty: 200, inspector: 'Tom J.',   status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0832', type: 'Inspection',    item: 'Control Panel C300', productionOrder: 'P-2026-0436', qty: 25,  inspector: 'Sarah K.', status: 'Failed',      result: 'fail'    },
  { orderNo: 'QO-2026-0831', type: 'Outgoing',      item: 'Motor B200',         productionOrder: 'P-2026-0435', qty: 40,  inspector: 'Tom J.',   status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0830', type: 'Inspection',    item: 'Widget A100',        productionOrder: 'P-2026-0434', qty: 60,  inspector: 'Sarah K.', status: 'Open',        result: 'pending' },
]

const NCRS = [
  { ncrNo: 'NCR-2026-041', item: 'Control Panel C300', defectType: 'Assembly Defect', qty: 10, severity: 'Major', status: 'Open',   disposition: 'Pending Review'    },
  { ncrNo: 'NCR-2026-040', item: 'Motor Housing B200', defectType: 'Dimensional',     qty: 2,  severity: 'Minor', status: 'Closed', disposition: 'Rework Completed'  },
  { ncrNo: 'NCR-2026-039', item: 'Widget A100',        defectType: 'Surface Finish',  qty: 5,  severity: 'Minor', status: 'Open',   disposition: 'Return to Vendor'  },
  { ncrNo: 'NCR-2026-038', item: 'Circuit Board X400', defectType: 'Functional',      qty: 3,  severity: 'Major', status: 'Open',   disposition: 'Engineering Review' },
  { ncrNo: 'NCR-2026-037', item: 'Bolt M8',            defectType: 'Dimensional',     qty: 25, severity: 'Minor', status: 'Closed', disposition: 'Scrap'             },
]

const KPI = {
  openOrders:          12,
  passRate30d:         96.8,
  failedInspections:   4,
  avgInspectionTimeHr: 0.4,
}

const TREND = {
  months: ['May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr'],
  passRates: [92.1, 93.5, 94.0, 95.2, 96.1, 94.8, 95.5, 96.3, 97.1, 96.5, 96.8, 96.8],
}

const DEFECT_CATEGORIES = [
  { label: 'Assembly',    pct: 40 },
  { label: 'Dimensional', pct: 25 },
  { label: 'Surface',     pct: 20 },
  { label: 'Functional',  pct: 10 },
  { label: 'Other',       pct:  5 },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  if (type === 'kpi')     return NextResponse.json({ kpi: KPI, trend: TREND, defectCategories: DEFECT_CATEGORIES })
  if (type === 'ncr')     return NextResponse.json({ data: NCRS, total: NCRS.length })

  const status = searchParams.get('status')
  let results = QUALITY_ORDERS
  if (status) results = results.filter(q => q.status === status)

  return NextResponse.json({ data: results, total: results.length, kpi: KPI })
}
