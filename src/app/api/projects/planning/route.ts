import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const tasks = [
    { id: 't0', label: 'ERP Implementation', indent: 0, startDay: 0, endDay: 105, status: 'In Progress', pct: 32, isPhase: true },
    { id: 't1', label: 'Phase 1: Discovery', indent: 1, startDay: 0, endDay: 14, status: 'Complete', pct: 100, isPhase: true },
    { id: 't1a', label: 'Kickoff Meeting', indent: 2, startDay: 0, endDay: 0, status: 'Complete', pct: 100, isMilestone: true },
    { id: 't1b', label: 'Requirements Gathering', indent: 2, startDay: 1, endDay: 9, status: 'Complete', pct: 100 },
    { id: 't1c', label: 'Gap Analysis', indent: 2, startDay: 10, endDay: 14, status: 'Complete', pct: 100 },
    { id: 't2', label: 'Phase 2: Design', indent: 1, startDay: 15, endDay: 44, status: 'In Progress', pct: 40, isPhase: true },
    { id: 't2a', label: 'System Architecture', indent: 2, startDay: 15, endDay: 24, status: 'In Progress', pct: 70, deps: ['t1c'] },
    { id: 't2b', label: 'Data Migration Plan', indent: 2, startDay: 25, endDay: 34, status: 'Not Started', pct: 0, deps: ['t2a'] },
    { id: 't2c', label: 'Integration Design', indent: 2, startDay: 35, endDay: 44, status: 'Not Started', pct: 0, deps: ['t2a'] },
    { id: 't3', label: 'Phase 3: Build', indent: 1, startDay: 45, endDay: 90, status: 'Not Started', pct: 0, isPhase: true },
    { id: 't3a', label: 'Core Configuration', indent: 2, startDay: 45, endDay: 60, status: 'Not Started', pct: 0, deps: ['t2b', 't2c'] },
    { id: 't3b', label: 'Custom Development', indent: 2, startDay: 61, endDay: 75, status: 'Not Started', pct: 0, deps: ['t3a'] },
    { id: 't3c', label: 'Testing', indent: 2, startDay: 76, endDay: 90, status: 'Not Started', pct: 0, deps: ['t3b'] },
    { id: 't4', label: 'Phase 4: Go-Live', indent: 1, startDay: 91, endDay: 105, status: 'Not Started', pct: 0, isMilestone: true, isPhase: true, deps: ['t3c'] },
  ]

  const resources = [
    { name: 'Sarah Chen', role: 'Project Manager', tasks: 8, hoursPlanned: 320, hoursActual: 148, pctAllocated: 100 },
    { name: 'Marcus R.', role: 'Solutions Architect', tasks: 5, hoursPlanned: 240, hoursActual: 92, pctAllocated: 80 },
    { name: 'Dev Team (4)', role: 'Developers', tasks: 3, hoursPlanned: 640, hoursActual: 0, pctAllocated: 0 },
    { name: 'Dana K.', role: 'Business Analyst', tasks: 6, hoursPlanned: 280, hoursActual: 120, pctAllocated: 90 },
    { name: 'IT Dept', role: 'Infrastructure', tasks: 2, hoursPlanned: 80, hoursActual: 12, pctAllocated: 20 },
    { name: 'QA Team (2)', role: 'Quality Assurance', tasks: 2, hoursPlanned: 160, hoursActual: 0, pctAllocated: 0 },
  ]

  return NextResponse.json({
    project: { id: 'PRJ-2026-001', name: 'ERP Implementation', client: 'Fabrikam Inc', startDate: '2026-04-01', endDate: '2026-07-15', pct: 32 },
    tasks,
    resources,
    updatedAt: new Date().toISOString(),
  })
}
