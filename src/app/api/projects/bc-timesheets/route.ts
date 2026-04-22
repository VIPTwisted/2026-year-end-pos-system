import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? ''
  const resourceId = searchParams.get('resourceId') ?? ''

  let where = 'WHERE 1=1'
  if (status) where += ` AND t.status = '${status.replace(/'/g, "''")}' `
  if (resourceId) where += ` AND t.resourceId = '${resourceId.replace(/'/g, "''")}' `

  const sheets = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT t.*, r.name AS resourceName, r.resourceNo
     FROM "BCTimeSheet" t
     LEFT JOIN "BCResource" r ON r.id = t.resourceId
     ${where}
     ORDER BY t.createdAt DESC`
  )
  return NextResponse.json(sheets)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { resourceId, startDate, endDate, ownerId, status } = body
    if (!startDate) return NextResponse.json({ error: 'Start date is required' }, { status: 400 })
    if (!endDate) return NextResponse.json({ error: 'End date is required' }, { status: 400 })

    const year = new Date().getFullYear()
    const prefix = `TS-${year}-`
    const last = await prisma.$queryRawUnsafe<{ sheetNo: string }[]>(
      `SELECT sheetNo FROM "BCTimeSheet" WHERE sheetNo LIKE '${prefix}%' ORDER BY sheetNo DESC LIMIT 1`
    )
    const seq = last.length > 0 ? parseInt(last[0].sheetNo.slice(prefix.length)) + 1 : 1
    const sheetNo = `${prefix}${String(seq).padStart(4, '0')}`
    const id = randomUUID()
    const now = new Date().toISOString()

    await prisma.$executeRawUnsafe(
      `INSERT INTO "BCTimeSheet" (id, sheetNo, resourceId, startDate, endDate, ownerId, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id, sheetNo,
      resourceId || null,
      startDate, endDate,
      ownerId?.trim() || null,
      status || 'Open',
      now
    )
    const rows = await prisma.$queryRawUnsafe<unknown[]>(`SELECT * FROM "BCTimeSheet" WHERE id = ?`, id)
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
