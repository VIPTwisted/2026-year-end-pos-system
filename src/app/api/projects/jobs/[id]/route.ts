import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rows = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT j.*, c.firstName, c.lastName FROM "Job" j LEFT JOIN "Customer" c ON c.id = j.customerId WHERE j.id = ?`, id
  )
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const now = new Date().toISOString()
    const fields: string[] = []
    const values: unknown[] = []

    const allowed = ['description', 'customerId', 'responsible', 'status', 'percentComplete', 'totalContractPrice', 'totalScheduleCost'] as const
    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`)
        values.push(body[key] === '' ? null : body[key])
      }
    }
    if (!fields.length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    fields.push('updatedAt = ?')
    values.push(now)
    values.push(id)

    await prisma.$executeRawUnsafe(`UPDATE "Job" SET ${fields.join(', ')} WHERE id = ?`, ...values)
    const rows = await prisma.$queryRawUnsafe<unknown[]>(`SELECT * FROM "Job" WHERE id = ?`, id)
    return NextResponse.json(rows[0])
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "JobPlanningLine" WHERE jobId = ?`, id)
    await prisma.$executeRawUnsafe(`DELETE FROM "JobTask" WHERE jobId = ?`, id)
    await prisma.$executeRawUnsafe(`DELETE FROM "Job" WHERE id = ?`, id)
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
