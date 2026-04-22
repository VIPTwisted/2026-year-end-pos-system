import { NextResponse } from 'next/server'

// TODO: Add CDXJob model to Prisma schema
// model CDXJob {
//   id           String   @id @default(cuid())
//   name         String
//   jobNumber    String   @unique   // P-1001, N-1001, etc.
//   type         String             // P-job | N-job
//   direction    String             // download | upload
//   description  String?
//   channels     String             // JSON array of channel names
//   schedule     String?            // cron expression or human label
//   lastSync     DateTime?
//   nextSync     DateTime?
//   status       String   @default("idle")  // idle | running | success | failed | scheduled
//   recordCount  Int?
//   duration     Int?               // seconds
//   createdAt    DateTime @default(now())
//   updatedAt    DateTime @updatedAt
// }

// Static mock data — replace with Prisma queries when model is added
const MOCK_JOBS = [
  { id: 'j001', jobNumber: 'P-1001', type: 'P-job', direction: 'download', name: 'Download Product Catalog',       status: 'success',   lastSync: '2026-04-22T08:15:00Z', schedule: 'Every 12h' },
  { id: 'j002', jobNumber: 'P-1002', type: 'P-job', direction: 'download', name: 'Download Price Lists',           status: 'success',   lastSync: '2026-04-22T06:00:00Z', schedule: 'Daily 6 AM' },
  { id: 'j003', jobNumber: 'P-1003', type: 'P-job', direction: 'download', name: 'Download Discounts & Promotions',status: 'success',   lastSync: '2026-04-22T09:00:00Z', schedule: 'Every 12h' },
  { id: 'j004', jobNumber: 'P-1004', type: 'P-job', direction: 'download', name: 'Download Customer Data',         status: 'failed',    lastSync: '2026-04-22T07:30:00Z', schedule: 'Every 12h' },
  { id: 'j005', jobNumber: 'P-1005', type: 'P-job', direction: 'download', name: 'Download Store Configurations',  status: 'idle',      lastSync: '2026-04-21T00:00:00Z', schedule: 'Daily midnight' },
  { id: 'j006', jobNumber: 'N-1001', type: 'N-job', direction: 'upload',   name: 'Upload Transactions',            status: 'running',   lastSync: '2026-04-22T10:45:00Z', schedule: 'Every 1h' },
  { id: 'j007', jobNumber: 'N-1002', type: 'N-job', direction: 'upload',   name: 'Upload Inventory Adjustments',   status: 'success',   lastSync: '2026-04-22T08:00:00Z', schedule: 'Every 12h' },
  { id: 'j008', jobNumber: 'N-1003', type: 'N-job', direction: 'upload',   name: 'Upload Customer Activity',       status: 'scheduled', lastSync: '2026-04-22T09:15:00Z', schedule: 'Every 1h' },
  { id: 'j009', jobNumber: 'N-1004', type: 'N-job', direction: 'upload',   name: 'Upload Sales Reports',           status: 'success',   lastSync: '2026-04-22T00:05:00Z', schedule: 'Daily 12:05 AM' },
]

// GET /api/channels/cdx
export async function GET() {
  return NextResponse.json({ jobs: MOCK_JOBS })
}

// POST /api/channels/cdx
// Stub: triggers a CDX job run (immediate or scheduled)
// TODO: Replace with actual job dispatch logic when CDXJob model + queue exists
export async function POST(req: Request) {
  try {
    const { jobId, channel, mode, scheduledAt } = await req.json()

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const job = MOCK_JOBS.find(j => j.id === jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Stub response — real implementation would enqueue a job and return a run ID
    return NextResponse.json({
      ok:          true,
      runId:       `run_${Date.now()}`,
      jobId,
      jobNumber:   job.jobNumber,
      channel:     channel ?? 'All Channels',
      mode:        mode ?? 'immediate',
      scheduledAt: scheduledAt ?? null,
      status:      mode === 'scheduled' ? 'scheduled' : 'running',
      dispatchedAt: new Date().toISOString(),
    }, { status: 202 })
  } catch (err) {
    console.error('[cdx POST]', err)
    return NextResponse.json({ error: 'Failed to dispatch job' }, { status: 500 })
  }
}
