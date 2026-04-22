import { NextRequest, NextResponse } from 'next/server'

const REQUESTS = [
  { id: 'lr1', employee: 'Aisha Torres',  dept: 'Operations',  leaveType: 'Vacation',    from: '2026-05-05', to: '2026-05-09', days: 5,  status: 'Approved',  approver: 'Kim Reyes' },
  { id: 'lr2', employee: 'Marcus Webb',   dept: 'Sales',       leaveType: 'Sick',        from: '2026-04-22', to: '2026-04-23', days: 2,  status: 'Pending',   approver: 'Kim Reyes' },
  { id: 'lr3', employee: 'Priya Nair',    dept: 'HR',          leaveType: 'FMLA',        from: '2026-05-01', to: '2026-07-25', days: 84, status: 'Approved',  approver: 'Dana Cole' },
  { id: 'lr4', employee: 'Jordan Blake',  dept: 'Finance',     leaveType: 'Bereavement', from: '2026-04-24', to: '2026-04-26', days: 3,  status: 'Approved',  approver: 'Kim Reyes' },
  { id: 'lr5', employee: 'Sam Okonkwo',   dept: 'Warehouse',   leaveType: 'Jury Duty',   from: '2026-05-12', to: '2026-05-16', days: 5,  status: 'Pending',   approver: 'Luis Park' },
  { id: 'lr6', employee: 'Tara Singh',    dept: 'Marketing',   leaveType: 'Vacation',    from: '2026-06-01', to: '2026-06-06', days: 6,  status: 'Pending',   approver: 'Dana Cole' },
  { id: 'lr7', employee: 'Devon Morris',  dept: 'Engineering', leaveType: 'Unpaid',      from: '2026-04-28', to: '2026-04-30', days: 3,  status: 'Denied',    approver: 'Luis Park' },
  { id: 'lr8', employee: 'Nadia Flores',  dept: 'Retail',      leaveType: 'Sick',        from: '2026-04-21', to: '2026-04-21', days: 1,  status: 'Cancelled', approver: 'Kim Reyes' },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const type   = searchParams.get('type')

  let data = REQUESTS
  if (status) data = data.filter(r => r.status === status)
  if (type)   data = data.filter(r => r.leaveType === type)

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = { id: `lr${Date.now()}`, status: 'Pending', ...body }
    return NextResponse.json(created, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
