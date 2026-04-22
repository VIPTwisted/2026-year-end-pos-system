import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function ensureTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "CommerceTask" (
      id TEXT PRIMARY KEY,
      taskNo TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      storeId TEXT,
      storeName TEXT,
      assignedTo TEXT,
      priority TEXT DEFAULT 'Normal',
      status TEXT DEFAULT 'Open',
      dueDate DATETIME,
      completedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable()
    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get('storeId')
    const status = searchParams.get('status')

    let query = `SELECT * FROM "CommerceTask" WHERE 1=1`
    const binds: unknown[] = []

    if (storeId) { query += ` AND storeId = ?`; binds.push(storeId) }
    if (status) { query += ` AND status = ?`; binds.push(status) }
    query += ` ORDER BY createdAt DESC`

    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM "CommerceTask" ORDER BY createdAt DESC
    `
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[commerce/tasks GET]', err)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const {
      title, description, storeId, storeName, assignedTo,
      priority = 'Normal', status = 'Open', dueDate,
    } = body as Record<string, unknown>

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const id = `ct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const taskNo = `TASK-${String(Date.now()).slice(-6)}`

    await prisma.$executeRaw`
      INSERT INTO "CommerceTask" (id, taskNo, title, description, storeId, storeName, assignedTo, priority, status, dueDate)
      VALUES (
        ${id}, ${taskNo}, ${(title as string).trim()}, ${description ?? null},
        ${storeId ?? null}, ${storeName ?? null}, ${assignedTo ?? null},
        ${priority}, ${status}, ${dueDate ?? null}
      )
    `
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM "CommerceTask" WHERE id = ${id}
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    console.error('[commerce/tasks POST]', err)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
