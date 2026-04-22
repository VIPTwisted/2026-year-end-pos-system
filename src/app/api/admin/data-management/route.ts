import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SEED_JOBS = [
  { id: '1', jobName: 'Customer Master Import Q1', direction: 'Import', entity: 'Customers V3', status: 'Completed', records: 1248, errors: 0, created: '2026-04-01', lastRun: '2026-04-01 09:15', errorDetails: [] },
  { id: '2', jobName: 'Product Catalog Export', direction: 'Export', entity: 'Released Products V2', status: 'Completed', records: 8753, errors: 0, created: '2026-04-10', lastRun: '2026-04-10 14:30', errorDetails: [] },
  { id: '3', jobName: 'Vendor Price List Import', direction: 'Import', entity: 'Vendor Price V1', status: 'Failed', records: 312, errors: 14, created: '2026-04-15', lastRun: '2026-04-15 11:22', errorDetails: [
    { row: 47, field: 'UnitPrice', message: 'Value must be > 0' },
    { row: 89, field: 'VendorCode', message: 'Vendor not found in system' },
    { row: 112, field: 'CurrencyCode', message: 'Unsupported currency: BTC' },
    { row: 201, field: 'EffectiveDate', message: 'Date format invalid: 15-04-26' },
  ]},
  { id: '4', jobName: 'GL Entries Nightly Export', direction: 'Export', entity: 'General Ledger Entries', status: 'Scheduled', records: 0, errors: 0, created: '2026-04-01', lastRun: null, errorDetails: [] },
  { id: '5', jobName: 'Inventory Adjustments Import', direction: 'Import', entity: 'Inventory Adjustments V2', status: 'Running', records: 2100, errors: 0, created: '2026-04-22', lastRun: '2026-04-22 08:00', errorDetails: [] },
  { id: '6', jobName: 'Sales Orders Apr Export', direction: 'Export', entity: 'Sales Orders V2', status: 'Completed', records: 4421, errors: 0, created: '2026-04-20', lastRun: '2026-04-20 23:59', errorDetails: [] },
  { id: '7', jobName: 'Employee Records Sync', direction: 'Import', entity: 'Workers V2', status: 'Scheduled', records: 0, errors: 0, created: '2026-04-18', lastRun: null, errorDetails: [] },
  { id: '8', jobName: 'Chart of Accounts Export', direction: 'Export', entity: 'Main Accounts V3', status: 'Ready', records: 0, errors: 0, created: '2026-04-22', lastRun: null, errorDetails: [] },
]

const SEED_ENTITIES = [
  { id: '1', name: 'Customers V3', module: 'Sales', description: 'Customer master records including addresses and contacts', fields: 48, supportedFormats: ['CSV', 'XLSX', 'XML'] },
  { id: '2', name: 'Released Products V2', module: 'Inventory', description: 'Product catalog with variants, pricing, and UOM', fields: 132, supportedFormats: ['CSV', 'XLSX', 'JSON'] },
  { id: '3', name: 'Vendor Price V1', module: 'Purchase', description: 'Vendor price lists and trade agreements', fields: 22, supportedFormats: ['CSV', 'XLSX'] },
  { id: '4', name: 'General Ledger Entries', module: 'Finance', description: 'GL journal entries and posting detail', fields: 34, supportedFormats: ['CSV', 'XLSX', 'XML'] },
  { id: '5', name: 'Inventory Adjustments V2', module: 'Inventory', description: 'Stock count and quantity adjustment records', fields: 18, supportedFormats: ['CSV', 'XLSX'] },
  { id: '6', name: 'Sales Orders V2', module: 'Sales', description: 'Sales order headers and lines', fields: 67, supportedFormats: ['CSV', 'XLSX', 'XML', 'JSON'] },
  { id: '7', name: 'Workers V2', module: 'HR', description: 'Employee master data and HR attributes', fields: 89, supportedFormats: ['CSV', 'XLSX'] },
  { id: '8', name: 'Main Accounts V3', module: 'Finance', description: 'Chart of accounts structure', fields: 24, supportedFormats: ['CSV', 'XLSX', 'XML'] },
  { id: '9', name: 'Purchase Orders V2', module: 'Purchase', description: 'Purchase order headers and lines', fields: 55, supportedFormats: ['CSV', 'XLSX', 'XML'] },
  { id: '10', name: 'Global Address Book V2', module: 'System', description: 'Party and address master records', fields: 31, supportedFormats: ['CSV', 'XLSX'] },
  { id: '11', name: 'Bank Accounts V2', module: 'Finance', description: 'Bank account and IBAN details', fields: 19, supportedFormats: ['CSV', 'XLSX'] },
  { id: '12', name: 'Item Coverage Groups', module: 'Planning', description: 'MRP coverage rules per item', fields: 14, supportedFormats: ['CSV'] },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const direction = searchParams.get('direction') ?? ''
  const status = searchParams.get('status') ?? ''
  const entitySearch = (searchParams.get('entitySearch') ?? '').toLowerCase()
  const include = searchParams.get('include') ?? ''

  let jobs = [...SEED_JOBS]
  if (direction && direction !== 'All') jobs = jobs.filter(j => j.direction === direction)
  if (status && status !== 'All') jobs = jobs.filter(j => j.status === status)

  let filteredEntities = [...SEED_ENTITIES]
  if (entitySearch) filteredEntities = filteredEntities.filter(e =>
    e.name.toLowerCase().includes(entitySearch) ||
    e.module.toLowerCase().includes(entitySearch) ||
    e.description.toLowerCase().includes(entitySearch)
  )

  if (include === 'entities') return NextResponse.json({ jobs, entities: filteredEntities })
  if (include === 'entities-only') return NextResponse.json(filteredEntities)
  return NextResponse.json(jobs)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { jobName, direction, entity, status } = body
    const newJob = {
      id: String(Date.now()),
      jobName: jobName ?? 'Untitled Job',
      direction: direction ?? 'Import',
      entity: entity ?? '',
      status: status ?? 'Ready',
      records: 0,
      errors: 0,
      created: new Date().toISOString().split('T')[0],
      lastRun: null,
      errorDetails: [],
    }
    return NextResponse.json(newJob, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, action } = body
    const job = SEED_JOBS.find(j => j.id === id)
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    if (action === 'run') return NextResponse.json({ ...job, status: 'Running', lastRun: new Date().toISOString() })
    if (action === 'cancel') return NextResponse.json({ ...job, status: 'Ready' })
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
