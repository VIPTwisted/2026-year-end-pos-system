import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SEED_JOBS = [
  { jobId: '1010', name: 'Customers', direction: 'Download' },
  { jobId: '1040', name: 'Workers', direction: 'Download' },
  { jobId: '1060', name: 'Loyalty', direction: 'Download' },
  { jobId: '1070', name: 'Products', direction: 'Download' },
  { jobId: '1080', name: 'Prices', direction: 'Download' },
  { jobId: '1090', name: 'Inventory', direction: 'Download' },
  { jobId: '9999', name: 'Full Sync', direction: 'Download' },
]

async function ensureTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "CdxJob" (
      id TEXT PRIMARY KEY,
      jobId TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      direction TEXT DEFAULT 'Download',
      lastRun DATETIME,
      status TEXT DEFAULT 'Pending',
      recordCount INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
}

async function seedJobs() {
  for (const j of SEED_JOBS) {
    const exists = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "CdxJob" WHERE jobId = ${j.jobId}
    `
    if (!exists.length) {
      const id = `cdx_${j.jobId}_${Math.random().toString(36).slice(2, 6)}`
      await prisma.$executeRaw`
        INSERT INTO "CdxJob" (id, jobId, name, direction, status)
        VALUES (${id}, ${j.jobId}, ${j.name}, ${j.direction}, 'Pending')
      `
    }
  }
}

export async function GET() {
  try {
    await ensureTable()
    await seedJobs()
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM "CdxJob" ORDER BY jobId ASC
    `
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[commerce/cdx GET]', err)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const { jobId, action = 'run' } = body as { jobId: string; action?: string }

    if (!jobId) return NextResponse.json({ error: 'jobId is required' }, { status: 400 })

    if (action === 'run') {
      await prisma.$executeRaw`
        UPDATE "CdxJob"
        SET status = 'Running', updatedAt = CURRENT_TIMESTAMP
        WHERE jobId = ${jobId}
      `
      const recordCount = Math.floor(Math.random() * 5000) + 100
      await prisma.$executeRaw`
        UPDATE "CdxJob"
        SET status = 'Success', lastRun = CURRENT_TIMESTAMP, recordCount = ${recordCount}, updatedAt = CURRENT_TIMESTAMP
        WHERE jobId = ${jobId}
      `
    } else if (action === 'reset') {
      await prisma.$executeRaw`
        UPDATE "CdxJob"
        SET status = 'Pending', lastRun = NULL, recordCount = 0, updatedAt = CURRENT_TIMESTAMP
        WHERE jobId = ${jobId}
      `
    } else if (action === 'schedule') {
      await prisma.$executeRaw`
        UPDATE "CdxJob"
        SET status = 'Scheduled', updatedAt = CURRENT_TIMESTAMP
        WHERE jobId = ${jobId}
      `
    }

    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM "CdxJob" WHERE jobId = ${jobId}
    `
    return NextResponse.json(rows[0] ?? {})
  } catch (err) {
    console.error('[commerce/cdx POST]', err)
    return NextResponse.json({ error: 'Failed to trigger job' }, { status: 500 })
  }
}
