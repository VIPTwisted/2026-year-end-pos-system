import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BOM_LIST = [
  { id: 'a100', name: 'Widget Assembly A100',   version: 'v3', status: 'Active',  item: '1000', effective: 'Jan 1, 2026',  leadTime: '5 days', scrapPct: 2 },
  { id: 'b200', name: 'Motor Housing B200',     version: 'v2', status: 'Active',  item: '1001', effective: 'Mar 1, 2025',  leadTime: '7 days', scrapPct: 1 },
  { id: 'c300', name: 'Control Panel C300',     version: 'v1', status: 'Active',  item: '1002', effective: 'Jun 1, 2025',  leadTime: '3 days', scrapPct: 0 },
  { id: 'coff', name: 'Coffee Blend Premium',   version: 'v1', status: 'Active',  item: '2001', effective: 'Jan 1, 2026',  leadTime: '1 day',  scrapPct: 5 },
  { id: 'x400', name: 'Circuit Board X400',     version: 'v2', status: 'Draft',   item: '3001', effective: 'TBD',          leadTime: '14 days',scrapPct: 3 },
]

const BOM_LINES = [
  { lineNo: 10,  itemNo: '1003',        description: 'Drive Unit D400',       type: 'Item',     qtyPer: 1,   uom: 'EA', scrap: '0%', leadTime: '28 days', costPerUnit: 210.00, lineCost: 210.00, warehouse: 'Main' },
  { lineNo: 20,  itemNo: '1004',        description: 'Standard Bolt M8',      type: 'Item',     qtyPer: 24,  uom: 'EA', scrap: '5%', leadTime: '3 days',  costPerUnit: 0.12,   lineCost: 2.88,   warehouse: 'Main' },
  { lineNo: 30,  itemNo: '1005',        description: 'Packaging Box',         type: 'Item',     qtyPer: 1,   uom: 'EA', scrap: '0%', leadTime: '5 days',  costPerUnit: 0.45,   lineCost: 0.45,   warehouse: 'Main' },
  { lineNo: 40,  itemNo: 'LABOR-ASSEM', description: 'Assembly Labor',        type: 'Labor',    qtyPer: 0.5, uom: 'HR', scrap: null, leadTime: null,      costPerUnit: 45.00,  lineCost: 22.50,  warehouse: null  },
  { lineNo: 50,  itemNo: 'OVERHEAD',    description: 'Plant Overhead',        type: 'Overhead', qtyPer: 1,   uom: 'EA', scrap: null, leadTime: null,      costPerUnit: 8.00,   lineCost: 8.00,   warehouse: null  },
  { lineNo: 60,  itemNo: '1006',        description: 'Steel Frame Insert',    type: 'Item',     qtyPer: 2,   uom: 'EA', scrap: '2%', leadTime: '10 days', costPerUnit: 3.10,   lineCost: 6.20,   warehouse: 'Main' },
  { lineNo: 70,  itemNo: '1007',        description: 'Rubber Gasket Set',     type: 'Item',     qtyPer: 1,   uom: 'EA', scrap: '1%', leadTime: '7 days',  costPerUnit: 1.25,   lineCost: 1.25,   warehouse: 'Main' },
  { lineNo: 80,  itemNo: '1008',        description: 'Mounting Bracket',      type: 'Item',     qtyPer: 4,   uom: 'EA', scrap: '0%', leadTime: '5 days',  costPerUnit: 0.85,   lineCost: 3.40,   warehouse: 'Main' },
  { lineNo: 90,  itemNo: '1009',        description: 'Control Chip CC-01',    type: 'Item',     qtyPer: 1,   uom: 'EA', scrap: '3%', leadTime: '14 days', costPerUnit: 6.20,   lineCost: 6.20,   warehouse: 'Main' },
  { lineNo: 100, itemNo: '1010',        description: 'Wiring Harness WH-50',  type: 'Item',     qtyPer: 1,   uom: 'EA', scrap: '0%', leadTime: '7 days',  costPerUnit: 4.50,   lineCost: 4.50,   warehouse: 'Main' },
  { lineNo: 110, itemNo: 'RAW-003',     description: 'Thermal Compound',      type: 'Item',     qtyPer: 5,   uom: 'G',  scrap: '5%', leadTime: '3 days',  costPerUnit: 0.09,   lineCost: 0.45,   warehouse: 'Main' },
  { lineNo: 120, itemNo: 'LABEL-001',   description: 'Product Label Set',     type: 'Item',     qtyPer: 1,   uom: 'EA', scrap: '0%', leadTime: '2 days',  costPerUnit: 0.00,   lineCost: 0.00,   warehouse: 'Main' },
]

const COST_ROLLUP = {
  materialCost:    213.83,
  laborCost:       22.50,
  overhead:        8.00,
  scrapAllowance:  4.28,
  totalStdCost:    248.61,
  totalBomCost:    274.33,
  salesPrice:      34.99,
  marginPct:       -683,
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const bom = BOM_LIST.find(b => b.id === id)
    if (!bom) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ bom, lines: BOM_LINES, costRollup: COST_ROLLUP })
  }

  return NextResponse.json({ data: BOM_LIST, total: BOM_LIST.length })
}
