import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const TIMESHEET_DATA = {
  week: { start: '2026-04-14', end: '2026-04-20', label: 'Apr 14 – Apr 20, 2026' },
  status: 'submitted',
  rows: [
    { project: 'PRJ-2026-001', activity: 'Development', hours: [6, 7, 6, 7, 6, 0, 0] },
    { project: 'PRJ-2026-001', activity: 'Meetings', hours: [1, 1, 0, 1, 1, 0, 0] },
    { project: 'PRJ-2026-002', activity: 'Analysis', hours: [0, 0, 2, 0, 0, 0, 0] },
    { project: 'PRJ-2026-002', activity: 'Documentation', hours: [0, 0, 0, 0, 1, 0, 0] },
    { project: 'PRJ-2026-003', activity: 'Design', hours: [1, 0, 0, 0, 0, 0, 0] },
    { project: 'Internal', activity: 'Admin', hours: [0, 0, 0, 0, 0, 0, 0] },
    { project: 'Internal', activity: 'Training', hours: [0, 0, 0, 0, 0, 0, 0] },
  ],
  history: [
    { week: 'Apr 7 – Apr 13', total: 40, status: 'approved' },
    { week: 'Mar 31 – Apr 6', total: 38, status: 'approved' },
    { week: 'Mar 24 – Mar 30', total: 40, status: 'approved' },
    { week: 'Mar 17 – Mar 23', total: 36, status: 'approved' },
  ],
}

export async function GET() {
  return NextResponse.json(TIMESHEET_DATA)
}

function genNo(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const resourceNo = searchParams.get('resourceNo')

    const timesheets = await prisma.timesheet.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(resourceNo ? { resourceNo } : {}),
      },
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(timesheets)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { resourceNo, resourceName, startDate, endDate, notes, lines = [] } = body

    if (!resourceNo) return NextResponse.json({ error: 'resourceNo required' }, { status: 400 })

    const totalHours = lines.reduce((s: number, l: { hours: number }) => s + (l.hours || 0), 0)

    const timesheet = await prisma.timesheet.create({
      data: {
        timesheetNo: genNo('TS'),
        resourceNo,
        resourceName: resourceName ?? null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalHours,
        notes: notes ?? null,
        lines: {
          create: lines.map((l: {
            dayOfWeek: string
            dayDate?: string
            lineType?: string
            projectNo?: string
            taskNo?: string
            description?: string
            hours?: number
          }) => ({
            dayDate: l.dayDate ? new Date(l.dayDate) : new Date(startDate),
            dayOfWeek: l.dayOfWeek,
            lineType: l.lineType ?? 'Resource',
            projectNo: l.projectNo ?? null,
            taskNo: l.taskNo ?? null,
            description: l.description ?? null,
            hours: l.hours ?? 0,
          })),
        },
      },
      include: { lines: true },
    })
    return NextResponse.json(timesheet, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
