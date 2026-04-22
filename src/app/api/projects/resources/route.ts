import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const blocked = searchParams.get('blocked')

  let where = 'WHERE 1=1'
  if (search) where += ` AND (resourceNo LIKE '%${search.replace(/'/g, "''")}%' OR name LIKE '%${search.replace(/'/g, "''")}%')`
  if (blocked !== null) where += ` AND blocked = ${blocked === 'true' ? 1 : 0}`

  const resources = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT * FROM "BCResource" ${where} ORDER BY resourceNo ASC`
  )
  return NextResponse.json(resources)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { resourceNo, name, resourceType, baseUnit, unitPrice, unitCost, useTimeSheet, blocked } = body
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    let no = resourceNo?.trim()
    if (!no) {
      const last = await prisma.$queryRawUnsafe<{ resourceNo: string }[]>(
        `SELECT resourceNo FROM "BCResource" ORDER BY createdAt DESC LIMIT 1`
      )
      const seq = last.length > 0 ? parseInt(last[0].resourceNo.replace(/\D/g, '') || '0') + 1 : 1
      no = `RES-${String(seq).padStart(4, '0')}`
    }

    const id = randomUUID()
    const now = new Date().toISOString()
    await prisma.$executeRawUnsafe(
      `INSERT INTO "BCResource" (id, resourceNo, name, resourceType, baseUnit, unitPrice, unitCost, useTimeSheet, blocked, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, no, name.trim(),
      resourceType || 'Person',
      baseUnit || 'hour',
      parseFloat(unitPrice) || 0,
      parseFloat(unitCost) || 0,
      useTimeSheet !== false ? 1 : 0,
      blocked ? 1 : 0,
      now
    )
    const rows = await prisma.$queryRawUnsafe<unknown[]>(`SELECT * FROM "BCResource" WHERE id = ?`, id)
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
