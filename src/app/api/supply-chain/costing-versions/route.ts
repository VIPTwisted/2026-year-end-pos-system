// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion
// Replace static data with prisma queries once CostingVersion model is added to schema.

import { NextResponse } from 'next/server'

const COSTING_VERSIONS = [
  { id: 'cv1', version: 'CV-2026-STD',   type: 'standard', status: 'active', validFrom: '2026-01-01', validTo: '2026-12-31', items: 147, description: 'Standard cost version FY2026' },
  { id: 'cv2', version: 'CV-2026-Q2',    type: 'planned',  status: 'active', validFrom: '2026-04-01', validTo: '2026-06-30', items: 52,  description: 'Planned Q2 cost scenario' },
  { id: 'cv3', version: 'CV-2025-STD',   type: 'standard', status: 'closed', validFrom: '2025-01-01', validTo: '2025-12-31', items: 139, description: 'FY2025 standard costs' },
  { id: 'cv4', version: 'CV-2026-DRAFT', type: 'planned',  status: 'draft',  validFrom: '2026-07-01', validTo: '2026-12-31', items: 0,   description: 'H2 2026 draft' },
]

let nextCV = COSTING_VERSIONS.length + 1

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const type   = searchParams.get('type')
  let list = [...COSTING_VERSIONS]
  if (status) list = list.filter(v => v.status === status)
  if (type)   list = list.filter(v => v.type === type)
  return NextResponse.json(list)
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.description?.trim()) return NextResponse.json({ error: 'description is required' }, { status: 400 })
  if (!body.validFrom)           return NextResponse.json({ error: 'validFrom is required' }, { status: 400 })
  if (!body.validTo)             return NextResponse.json({ error: 'validTo is required' }, { status: 400 })

  const num = `CV-${body.type?.toUpperCase() ?? 'PLAN'}-${Date.now().toString().slice(-6)}`
  nextCV++
  const ver = {
    id: `cv${nextCV}`,
    version: num,
    type: body.type ?? 'planned',
    status: 'draft',
    validFrom: body.validFrom,
    validTo: body.validTo,
    items: 0,
    description: body.description,
  }
  COSTING_VERSIONS.push(ver)
  return NextResponse.json(ver, { status: 201 })
}
