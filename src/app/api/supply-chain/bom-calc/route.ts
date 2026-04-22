// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion
// Replace static data with prisma queries once BomCalculation model is added to schema.

import { NextResponse } from 'next/server'

const BOM_CALCS = [
  { id: 'bc1', item: 'Smart Sensor PRO',     sku: 'PRD-101', bomVer: 'BOM-101-v3', calcCost: 28.44, material: 19.60, labor: 5.20, overhead: 3.64, lastCalc: '2026-04-10', version: 'CV-2026-STD', status: 'current' },
  { id: 'bc2', item: 'Controller Unit A',    sku: 'PRD-205', bomVer: 'BOM-205-v2', calcCost: 62.18, material: 44.00, labor: 10.80,overhead: 7.38, lastCalc: '2026-04-08', version: 'CV-2026-STD', status: 'current' },
  { id: 'bc3', item: 'Display Module 7"',    sku: 'PRD-317', bomVer: 'BOM-317-v1', calcCost: 41.90, material: 32.00, labor: 6.40, overhead: 3.50, lastCalc: '2026-03-25', version: 'CV-2026-STD', status: 'stale'   },
  { id: 'bc4', item: 'Power Supply 12V',     sku: 'PRD-422', bomVer: 'BOM-422-v4', calcCost: 15.70, material: 10.80, labor: 3.20, overhead: 1.70, lastCalc: '2026-04-15', version: 'CV-2026-STD', status: 'current' },
  { id: 'bc5', item: 'Wireless Module BLE5', sku: 'PRD-538', bomVer: 'BOM-538-v2', calcCost: 18.92, material: 13.40, labor: 3.60, overhead: 1.92, lastCalc: '2026-04-10', version: 'CV-2026-Q2',  status: 'current' },
]

let nextBC = BOM_CALCS.length + 1

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status  = searchParams.get('status')
  const version = searchParams.get('version')
  let list = [...BOM_CALCS]
  if (status)  list = list.filter(b => b.status === status)
  if (version) list = list.filter(b => b.version === version)
  return NextResponse.json(list)
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.item?.trim())  return NextResponse.json({ error: 'item is required' }, { status: 400 })
  if (!body.sku?.trim())   return NextResponse.json({ error: 'sku is required' }, { status: 400 })
  if (!body.bomVer?.trim())return NextResponse.json({ error: 'bomVer is required' }, { status: 400 })

  const material = parseFloat(body.material ?? 0)
  const labor    = parseFloat(body.labor ?? 0)
  const overhead = parseFloat(body.overhead ?? 0)
  const calcCost = material + labor + overhead

  nextBC++
  const calc = {
    id: `bc${nextBC}`,
    item: body.item,
    sku: body.sku,
    bomVer: body.bomVer,
    calcCost,
    material,
    labor,
    overhead,
    lastCalc: new Date().toISOString().slice(0, 10),
    version: body.version ?? 'CV-2026-STD',
    status: 'current',
  }
  BOM_CALCS.push(calc)
  return NextResponse.json(calc, { status: 201 })
}
