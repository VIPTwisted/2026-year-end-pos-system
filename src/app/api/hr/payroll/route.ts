import { NextRequest, NextResponse } from 'next/server'

const RUNS = [
  { id: 'r1', runNum: 'PR-2026-008', period: 'Apr 16–30, 2026', status: 'In Progress', employees: 52, gross: 186240, net: 142105, taxes: 44135,  postedDate: null },
  { id: 'r2', runNum: 'PR-2026-007', period: 'Apr 1–15, 2026',  status: 'Posted',      employees: 52, gross: 184800, net: 141360, taxes: 43440,  postedDate: '2026-04-17' },
  { id: 'r3', runNum: 'PR-2026-006', period: 'Mar 16–31, 2026', status: 'Posted',      employees: 51, gross: 181950, net: 139452, taxes: 42498,  postedDate: '2026-04-02' },
  { id: 'r4', runNum: 'PR-2026-005', period: 'Mar 1–15, 2026',  status: 'Posted',      employees: 51, gross: 180720, net: 138651, taxes: 42069,  postedDate: '2026-03-18' },
  { id: 'r5', runNum: 'PR-2026-004', period: 'Feb 16–28, 2026', status: 'Approved',    employees: 50, gross: 178500, net: 136950, taxes: 41550,  postedDate: null },
  { id: 'r6', runNum: 'PR-2026-003', period: 'Feb 1–15, 2026',  status: 'Calculated',  employees: 50, gross: 177000, net: 135705, taxes: 41295,  postedDate: null },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const data = status ? RUNS.filter(r => r.status === status) : RUNS
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = {
      id: `r${Date.now()}`,
      runNum: `PR-2026-${String(RUNS.length + 1).padStart(3, '0')}`,
      status: 'In Progress',
      employees: 0,
      gross: 0,
      net: 0,
      taxes: 0,
      postedDate: null,
      ...body,
    }
    return NextResponse.json(created, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
