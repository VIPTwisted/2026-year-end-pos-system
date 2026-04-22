// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion
// Replace static data with prisma queries once ItemCost model is added to schema.

import { NextResponse } from 'next/server'

const ITEM_COSTS = [
  { id: 'ic01', sku: 'ELEC-001', name: 'Microcontroller MCU-32',   costGroup: 'Electronics', unitCost: 4.28,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic02', sku: 'ELEC-002', name: 'Capacitor 100uF 25V',       costGroup: 'Electronics', unitCost: 0.09,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic03', sku: 'ELEC-018', name: 'Li-Ion Battery 5000mAh',    costGroup: 'Electronics', unitCost: 12.40, currency: 'USD', effectiveDate: '2026-04-01', version: 'CV-2026-Q2'  },
  { id: 'ic04', sku: 'MECH-012', name: 'Steel Bracket 6"',          costGroup: 'Hardware',    unitCost: 0.87,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic05', sku: 'MECH-031', name: 'Aluminum Extrusion 1m',     costGroup: 'Hardware',    unitCost: 6.75,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic06', sku: 'PACK-005', name: 'Foam Insert Large',         costGroup: 'Packaging',   unitCost: 1.15,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic07', sku: 'RAW-003',  name: 'ABS Plastic Pellets (kg)',  costGroup: 'Raw Material',unitCost: 2.20,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
]

let nextIC = ITEM_COSTS.length + 1

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const costGroup = searchParams.get('costGroup')
  const version   = searchParams.get('version')
  let list = [...ITEM_COSTS]
  if (costGroup) list = list.filter(i => i.costGroup === costGroup)
  if (version)   list = list.filter(i => i.version === version)
  return NextResponse.json(list)
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.sku?.trim())     return NextResponse.json({ error: 'sku is required' }, { status: 400 })
  if (!body.name?.trim())    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  if (!body.unitCost)        return NextResponse.json({ error: 'unitCost is required' }, { status: 400 })
  if (!body.effectiveDate)   return NextResponse.json({ error: 'effectiveDate is required' }, { status: 400 })

  nextIC++
  const item = {
    id: `ic${String(nextIC).padStart(2, '0')}`,
    sku: body.sku,
    name: body.name,
    costGroup: body.costGroup ?? 'General',
    unitCost: parseFloat(body.unitCost),
    currency: body.currency ?? 'USD',
    effectiveDate: body.effectiveDate,
    version: body.version ?? 'CV-2026-STD',
  }
  ITEM_COSTS.push(item)
  return NextResponse.json(item, { status: 201 })
}
