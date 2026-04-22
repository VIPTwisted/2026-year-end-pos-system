import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SEED_CONFIGS = [
  { id: 'ERC-001', name: 'XBRL Financial Statements', format: 'XBRL', version: '2.4.1', provider: 'FASB/SEC', status: 'Active', lastRun: '2026-04-15T08:00:00Z', nextScheduled: '2026-07-15T08:00:00Z', outputSize: '142 KB', runCount: 12 },
  { id: 'ERC-002', name: 'EDI 850 Purchase Order', format: 'X12 EDI', version: '5010', provider: 'GS1', status: 'Active', lastRun: '2026-04-22T06:00:00Z', nextScheduled: '2026-04-23T06:00:00Z', outputSize: '38 KB', runCount: 288 },
  { id: 'ERC-003', name: 'EU VAT Return XML', format: 'XML', version: '3.0', provider: 'EU Tax Authority', status: 'Active', lastRun: '2026-04-01T09:00:00Z', nextScheduled: '2026-05-01T09:00:00Z', outputSize: '56 KB', runCount: 8 },
  { id: 'ERC-004', name: 'Sales Tax JSON Feed', format: 'JSON', version: '1.2', provider: 'Avalara', status: 'Active', lastRun: '2026-04-22T00:00:00Z', nextScheduled: '2026-04-23T00:00:00Z', outputSize: '204 KB', runCount: 365 },
  { id: 'ERC-005', name: 'EDIFACT INVOIC D96A', format: 'EDIFACT', version: 'D96A', provider: 'UN/CEFACT', status: 'Active', lastRun: '2026-04-21T18:00:00Z', nextScheduled: '2026-04-22T18:00:00Z', outputSize: '88 KB', runCount: 156 },
  { id: 'ERC-006', name: 'Monthly P&L PDF Report', format: 'PDF', version: '1.0', provider: 'Internal', status: 'Active', lastRun: '2026-04-01T07:00:00Z', nextScheduled: '2026-05-01T07:00:00Z', outputSize: '2.1 MB', runCount: 14 },
  { id: 'ERC-007', name: 'Inventory Excel Export', format: 'Excel', version: '2.1', provider: 'Internal', status: 'Active', lastRun: '2026-04-22T04:00:00Z', nextScheduled: '2026-04-23T04:00:00Z', outputSize: '1.8 MB', runCount: 90 },
  { id: 'ERC-008', name: 'OSHA 300 XML Submission', format: 'XML', version: '1.5', provider: 'OSHA', status: 'Draft', lastRun: null, nextScheduled: '2026-12-31T12:00:00Z', outputSize: null, runCount: 0 },
]

const RUN_HISTORY = [
  { id: 'RH-001', config: 'Sales Tax JSON Feed', status: 'Success', started: '2026-04-22T00:00:00Z', completed: '2026-04-22T00:00:42Z', outputSize: '204 KB', configId: 'ERC-004' },
  { id: 'RH-002', config: 'EDI 850 Purchase Order', status: 'Success', started: '2026-04-22T06:00:00Z', completed: '2026-04-22T06:00:18Z', outputSize: '38 KB', configId: 'ERC-002' },
  { id: 'RH-003', config: 'Inventory Excel Export', status: 'Success', started: '2026-04-22T04:00:00Z', completed: '2026-04-22T04:02:11Z', outputSize: '1.8 MB', configId: 'ERC-007' },
  { id: 'RH-004', config: 'EDIFACT INVOIC D96A', status: 'Failed', started: '2026-04-21T18:00:00Z', completed: '2026-04-21T18:00:05Z', outputSize: null, configId: 'ERC-005' },
  { id: 'RH-005', config: 'EU VAT Return XML', status: 'Success', started: '2026-04-01T09:00:00Z', completed: '2026-04-01T09:01:03Z', outputSize: '56 KB', configId: 'ERC-003' },
  { id: 'RH-006', config: 'Monthly P&L PDF Report', status: 'Success', started: '2026-04-01T07:00:00Z', completed: '2026-04-01T07:03:44Z', outputSize: '2.1 MB', configId: 'ERC-006' },
  { id: 'RH-007', config: 'XBRL Financial Statements', status: 'Success', started: '2026-04-15T08:00:00Z', completed: '2026-04-15T08:00:58Z', outputSize: '142 KB', configId: 'ERC-001' },
  { id: 'RH-008', config: 'Sales Tax JSON Feed', status: 'Running', started: '2026-04-22T12:00:00Z', completed: null, outputSize: null, configId: 'ERC-004' },
]

export async function GET() {
  return NextResponse.json({ configs: SEED_CONFIGS, runHistory: RUN_HISTORY })
}

export async function POST(req: Request) {
  const body = await req.json()
  const config = {
    id: `ERC-${String(SEED_CONFIGS.length + 1).padStart(3, '0')}`,
    runCount: 0,
    lastRun: null,
    ...body,
  }
  return NextResponse.json(config, { status: 201 })
}
