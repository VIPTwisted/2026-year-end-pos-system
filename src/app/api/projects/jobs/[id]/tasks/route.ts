import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tasks = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT * FROM "JobTask" WHERE jobId = ? ORDER BY taskNo ASC`, id
  )
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { taskNo, description, taskType, percentComplete, scheduleTotalCost, usageTotalCost } = body
    if (!taskNo?.trim()) return NextResponse.json({ error: 'Task No is required' }, { status: 400 })
    if (!description?.trim()) return NextResponse.json({ error: 'Description is required' }, { status: 400 })

    const taskId = randomUUID()
    await prisma.$executeRawUnsafe(
      `INSERT INTO "JobTask" (id, jobId, taskNo, description, taskType, percentComplete, scheduleTotalCost, usageTotalCost)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      taskId, id,
      taskNo.trim(), description.trim(),
      taskType || 'Posting',
      parseFloat(percentComplete) || 0,
      parseFloat(scheduleTotalCost) || 0,
      parseFloat(usageTotalCost) || 0
    )
    const rows = await prisma.$queryRawUnsafe<unknown[]>(`SELECT * FROM "JobTask" WHERE id = ?`, taskId)
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
