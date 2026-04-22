// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion
// Once MaintenanceRequest is added to prisma/schema.prisma, replace static data with prisma queries.

import { NextResponse } from 'next/server'

const MOCK_REQUESTS = [
  { id: 'mr1', reqNo: 'MR-001', assetId: 'a5', type: 'reactive',   priority: 'high',   status: 'open',        assignedTech: 'J. Torres', dueDate: '2026-04-25', description: 'Brake system failure', notes: null },
  { id: 'mr2', reqNo: 'MR-002', assetId: 'a2', type: 'preventive', priority: 'medium', status: 'in_progress', assignedTech: 'M. Davis',  dueDate: '2026-04-30', description: 'Belt tensioner service', notes: null },
  { id: 'mr3', reqNo: 'MR-003', assetId: 'a3', type: 'inspection', priority: 'low',    status: 'completed',   assignedTech: 'L. Chen',   dueDate: '2026-04-15', description: 'OSHA quarterly inspection', notes: null },
]

let nextMR = MOCK_REQUESTS.length + 1

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status')
  const assetId  = searchParams.get('assetId')
  const priority = searchParams.get('priority')
  let list = [...MOCK_REQUESTS]
  if (status)   list = list.filter(r => r.status === status)
  if (assetId)  list = list.filter(r => r.assetId === assetId)
  if (priority) list = list.filter(r => r.priority === priority)
  return NextResponse.json(list)
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.assetId)           return NextResponse.json({ error: 'assetId is required' }, { status: 400 })
  if (!body.description?.trim()) return NextResponse.json({ error: 'description is required' }, { status: 400 })
  if (!body.dueDate)           return NextResponse.json({ error: 'dueDate is required' }, { status: 400 })

  const num = `MR-${String(nextMR).padStart(3, '0')}`
  nextMR++
  const req_ = {
    id: `mr${nextMR}`,
    reqNo: num,
    assetId: body.assetId,
    type: body.type ?? 'preventive',
    priority: body.priority ?? 'medium',
    status: 'open',
    assignedTech: body.assignedTech ?? null,
    dueDate: body.dueDate,
    description: body.description,
    notes: body.notes ?? null,
  }
  MOCK_REQUESTS.push(req_)
  return NextResponse.json(req_, { status: 201 })
}
