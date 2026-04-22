import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lines = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT p.*, t.taskNo, t.description AS taskDescription
     FROM "JobPlanningLine" p
     LEFT JOIN "JobTask" t ON t.id = p.taskId
     WHERE p.jobId = ?
     ORDER BY p.planningDate ASC`, id
  )
  return NextResponse.json(lines)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { taskId, lineType, entryType, resourceNo, description, planningDate, quantity, unitPrice, totalPrice } = body

    const lineId = randomUUID()
    const qty = parseFloat(quantity) || 1
    const up = parseFloat(unitPrice) || 0
    const tp = parseFloat(totalPrice) || qty * up

    await prisma.$executeRawUnsafe(
      `INSERT INTO "JobPlanningLine" (id, jobId, taskId, lineType, entryType, resourceNo, description, planningDate, quantity, unitPrice, totalPrice)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      lineId, id,
      taskId || null,
      lineType || 'Budget',
      entryType || 'Resource',
      resourceNo?.trim() || null,
      description?.trim() || null,
      planningDate || null,
      qty, up, tp
    )
    const rows = await prisma.$queryRawUnsafe<unknown[]>(`SELECT * FROM "JobPlanningLine" WHERE id = ?`, lineId)
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
