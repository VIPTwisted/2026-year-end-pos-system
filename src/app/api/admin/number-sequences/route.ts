import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SEED_SEQUENCES = [
  { id: '1', code: 'SO', name: 'Sales Order', module: 'Sales', format: 'SO-{####}', prefix: 'SO', suffix: '', separator: '-', digits: 4, nextValue: 1042, scope: 'Company', manual: false, continuous: true, status: 'Active' },
  { id: '2', code: 'PO', name: 'Purchase Order', module: 'Purchase', format: 'PO-{####}', prefix: 'PO', suffix: '', separator: '-', digits: 4, nextValue: 873, scope: 'Company', manual: false, continuous: true, status: 'Active' },
  { id: '3', code: 'INV', name: 'Sales Invoice', module: 'Finance', format: 'INV-{YYYY}-{####}', prefix: 'INV', suffix: '', separator: '-', digits: 4, nextValue: 2156, scope: 'Company', manual: false, continuous: true, status: 'Active' },
  { id: '4', code: 'CUST', name: 'Customer Account', module: 'Sales', format: 'CUST-{#####}', prefix: 'CUST', suffix: '', separator: '-', digits: 5, nextValue: 10087, scope: 'Company', manual: false, continuous: false, status: 'Active' },
  { id: '5', code: 'VEND', name: 'Vendor Account', module: 'Purchase', format: 'VEND-{#####}', prefix: 'VEND', suffix: '', separator: '-', digits: 5, nextValue: 3021, scope: 'Company', manual: false, continuous: false, status: 'Active' },
  { id: '6', code: 'ITEM', name: 'Item Number', module: 'Inventory', format: 'ITEM-{######}', prefix: 'ITEM', suffix: '', separator: '-', digits: 6, nextValue: 50322, scope: 'Shared', manual: false, continuous: false, status: 'Active' },
  { id: '7', code: 'WO', name: 'Work Order', module: 'Production', format: 'WO-{YYYY}-{###}', prefix: 'WO', suffix: '', separator: '-', digits: 3, nextValue: 412, scope: 'Company', manual: false, continuous: true, status: 'Active' },
  { id: '8', code: 'HR-EMP', name: 'Employee ID', module: 'HR', format: 'EMP-{#####}', prefix: 'EMP', suffix: '', separator: '-', digits: 5, nextValue: 1203, scope: 'Legal entity', manual: false, continuous: true, status: 'Active' },
  { id: '9', code: 'SREQ', name: 'Service Request', module: 'Service', format: 'SR-{YYYY}-{####}', prefix: 'SR', suffix: '', separator: '-', digits: 4, nextValue: 784, scope: 'Company', manual: true, continuous: false, status: 'Active' },
  { id: '10', code: 'TRANS', name: 'Transfer Order', module: 'Inventory', format: 'TO-{####}', prefix: 'TO', suffix: '', separator: '-', digits: 4, nextValue: 231, scope: 'Company', manual: false, continuous: true, status: 'Active' },
  { id: '11', code: 'PROJ', name: 'Project ID', module: 'Finance', format: 'PROJ-{###}-{YY}', prefix: 'PROJ', suffix: '', separator: '-', digits: 3, nextValue: 67, scope: 'Company', manual: false, continuous: false, status: 'Active' },
  { id: '12', code: 'RET', name: 'Return Order', module: 'Sales', format: 'RET-{####}', prefix: 'RET', suffix: '', separator: '-', digits: 4, nextValue: 189, scope: 'Company', manual: false, continuous: false, status: 'Active' },
  { id: '13', code: 'BAT', name: 'Batch Number', module: 'Production', format: 'BAT-{YYYY}{MM}-{###}', prefix: 'BAT', suffix: '', separator: '-', digits: 3, nextValue: 9041, scope: 'Shared', manual: false, continuous: true, status: 'Active' },
  { id: '14', code: 'APINV', name: 'AP Invoice', module: 'Finance', format: 'APINV-{YYYY}-{#####}', prefix: 'APINV', suffix: '', separator: '-', digits: 5, nextValue: 4433, scope: 'Legal entity', manual: false, continuous: true, status: 'Suspended' },
  { id: '15', code: 'LEGAC', name: 'Legacy Doc Ref', module: 'Finance', format: 'LEG-{########}', prefix: 'LEG', suffix: '', separator: '-', digits: 8, nextValue: 99999999, scope: 'Company', manual: true, continuous: false, status: 'Completed' },
]

function buildPreview(seq: (typeof SEED_SEQUENCES)[0]): string {
  const now = new Date()
  const yyyy = now.getFullYear().toString()
  const yy = yyyy.slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const numPart = String(seq.nextValue).padStart(seq.digits, '0')
  return seq.format
    .replace('{YYYY}', yyyy)
    .replace('{YY}', yy)
    .replace('{MM}', mm)
    .replace(/\{#+\}/, numPart)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = (searchParams.get('search') ?? '').toLowerCase()
  const module_ = searchParams.get('module') ?? ''

  let result = [...SEED_SEQUENCES]
  if (search) result = result.filter(s => s.code.toLowerCase().includes(search) || s.name.toLowerCase().includes(search))
  if (module_ && module_ !== 'All') result = result.filter(s => s.module === module_)

  return NextResponse.json(result.map(s => ({ ...s, preview: buildPreview(s) })))
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const newSeq = { id: String(Date.now()), ...body, nextValue: body.startValue ?? 1, status: 'Active' }
    return NextResponse.json({ ...newSeq, preview: buildPreview(newSeq) }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, action } = body
    const seq = SEED_SEQUENCES.find(s => s.id === id)
    if (!seq) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (action === 'reset') return NextResponse.json({ ...seq, nextValue: 1, preview: buildPreview({ ...seq, nextValue: 1 }) })
    if (action === 'preview') return NextResponse.json({ preview: buildPreview(seq) })
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
