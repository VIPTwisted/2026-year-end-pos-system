// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion
// Once AssetItem is added to prisma/schema.prisma, replace the static data below with real prisma queries.

import { NextResponse } from 'next/server'

const MOCK_ASSETS = [
  { id: 'a1', assetNo: 'AST-001', name: 'Forklift #1',      type: 'vehicle',  serialNumber: 'FKL-2023-882', location: 'Warehouse A', status: 'in_service',        purchaseDate: '2023-06-15', warrantyExpiry: '2026-06-15', cost: 38500 },
  { id: 'a2', assetNo: 'AST-002', name: 'Conveyor Belt B',  type: 'machine',  serialNumber: 'CVB-2022-441', location: 'Warehouse B', status: 'under_maintenance',  purchaseDate: '2022-03-10', warrantyExpiry: '2025-03-10', cost: 72000 },
  { id: 'a3', assetNo: 'AST-003', name: 'Office HVAC Unit', type: 'facility', serialNumber: 'HVC-2021-115', location: 'HQ Floor 2',  status: 'in_service',        purchaseDate: '2021-09-01', warrantyExpiry: '2024-09-01', cost: 15000 },
  { id: 'a4', assetNo: 'AST-004', name: 'Pallet Jack Set',  type: 'tool',     serialNumber: null,           location: 'Warehouse A', status: 'in_service',        purchaseDate: '2024-01-20', warrantyExpiry: null,         cost: 2400  },
  { id: 'a5', assetNo: 'AST-005', name: 'Delivery Van 003', type: 'vehicle',  serialNumber: 'VAN-2020-003', location: 'Yard',        status: 'critical',          purchaseDate: '2020-05-12', warrantyExpiry: null,         cost: 32000 },
  { id: 'a6', assetNo: 'AST-006', name: 'Compressor Unit',  type: 'machine',  serialNumber: 'CMP-2023-77',  location: 'Warehouse C', status: 'in_service',        purchaseDate: '2023-11-01', warrantyExpiry: '2026-11-01', cost: 9800  },
]

let nextId = MOCK_ASSETS.length + 1

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const type   = searchParams.get('type')
  let assets = [...MOCK_ASSETS]
  if (status) assets = assets.filter(a => a.status === status)
  if (type)   assets = assets.filter(a => a.type === type)
  return NextResponse.json(assets)
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  const num = `AST-${String(nextId).padStart(3, '0')}`
  nextId++
  const asset = {
    id: `a${nextId}`,
    assetNo: num,
    name: body.name,
    type: body.type ?? 'machine',
    serialNumber: body.serialNumber ?? null,
    location: body.location ?? null,
    status: 'in_service',
    purchaseDate: body.purchaseDate ?? null,
    warrantyExpiry: body.warrantyExpiry ?? null,
    cost: body.cost ?? null,
  }
  MOCK_ASSETS.push(asset)
  return NextResponse.json(asset, { status: 201 })
}
