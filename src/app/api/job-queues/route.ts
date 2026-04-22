// TODO: Add JobQueue model to Prisma schema (fields: id, name, type, schedule, status, lastRunAt, nextRunAt, lastDuration, lastError)
// For now, this API serves mock static data. Once schema is added, swap getJobs() for prisma.jobQueue.findMany()

import { NextResponse } from 'next/server'

export interface JobQueueRecord {
  id: string
  name: string
  type: string
  schedule: string
  scheduleLabel: string
  status: 'active' | 'paused' | 'error' | 'running'
  lastRunAt: string | null
  nextRunAt: string | null
  lastDuration: number | null   // seconds
  lastError: string | null
}

const MOCK_JOBS: JobQueueRecord[] = [
  {
    id: 'jq_01',
    name: 'Post Recurring Journals',
    type: 'Finance',
    schedule: '0 0 * * *',
    scheduleLabel: 'Daily at midnight',
    status: 'active',
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    lastDuration: 4,
    lastError: null,
  },
  {
    id: 'jq_02',
    name: 'Send Marketing Emails',
    type: 'Marketing',
    schedule: '0 8 * * 1-5',
    scheduleLabel: 'Weekdays at 8 AM',
    status: 'active',
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    lastDuration: 18,
    lastError: null,
  },
  {
    id: 'jq_03',
    name: 'Sync Exchange Rates',
    type: 'Finance',
    schedule: '0 */4 * * *',
    scheduleLabel: 'Every 4 hours',
    status: 'active',
    lastRunAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    nextRunAt: new Date(Date.now() + 1000 * 60 * 150).toISOString(),
    lastDuration: 2,
    lastError: null,
  },
  {
    id: 'jq_04',
    name: 'Calculate Inventory Reorder',
    type: 'Inventory',
    schedule: '30 6 * * *',
    scheduleLabel: 'Daily at 6:30 AM',
    status: 'error',
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 21).toISOString(),
    lastDuration: 12,
    lastError: 'Timeout: inventory service did not respond within 30s',
  },
  {
    id: 'jq_05',
    name: 'Generate Monthly Reports',
    type: 'Reporting',
    schedule: '0 2 1 * *',
    scheduleLabel: 'Monthly on the 1st at 2 AM',
    status: 'paused',
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    nextRunAt: null,
    lastDuration: 47,
    lastError: null,
  },
  {
    id: 'jq_06',
    name: 'Purge Audit Logs',
    type: 'Maintenance',
    schedule: '0 3 * * 0',
    scheduleLabel: 'Sundays at 3 AM',
    status: 'active',
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    lastDuration: 8,
    lastError: null,
  },
  {
    id: 'jq_07',
    name: 'Update Customer Balances',
    type: 'Finance',
    schedule: '*/30 * * * *',
    scheduleLabel: 'Every 30 minutes',
    status: 'running',
    lastRunAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    nextRunAt: new Date(Date.now() + 1000 * 60 * 27).toISOString(),
    lastDuration: null,
    lastError: null,
  },
  {
    id: 'jq_08',
    name: 'Sync ERP Data',
    type: 'Integration',
    schedule: '0 */2 * * *',
    scheduleLabel: 'Every 2 hours',
    status: 'active',
    lastRunAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    nextRunAt: new Date(Date.now() + 1000 * 60 * 75).toISOString(),
    lastDuration: 31,
    lastError: null,
  },
]

// In-memory state for pause/resume during demo
const jobState: Map<string, 'active' | 'paused' | 'error' | 'running'> = new Map()

export function getJobs(): JobQueueRecord[] {
  return MOCK_JOBS.map(j => ({
    ...j,
    status: (jobState.get(j.id) ?? j.status) as JobQueueRecord['status'],
  }))
}

export function setJobStatus(id: string, status: 'active' | 'paused' | 'error' | 'running') {
  jobState.set(id, status)
}

export async function GET() {
  return NextResponse.json(getJobs())
}
