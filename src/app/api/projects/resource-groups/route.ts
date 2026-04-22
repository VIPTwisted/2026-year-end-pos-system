import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET() {
  const groups = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT * FROM "ResourceGroup" ORDER BY groupNo ASC`
  )
  return NextResponse.json(groups)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { groupNo, name, unitOfMeasure } = body
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    let no = groupNo?.trim()
    if (!no) {
      const last = await prisma.$queryRawUnsafe<{ groupNo: string }[]>(
        `SELECT groupNo FROM "ResourceGroup" ORDER BY createdAt DESC LIMIT 1`
      )
      const seq = last.length > 0 ? parseInt(last[0].groupNo.replace(/\D/g, '') || '0') + 1 : 1
      no = `RG-${String(seq).padStart(3, '0')}`
    }

    const id = randomUUID()
    const now = new Date().toISOString()
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ResourceGroup" (id, groupNo, name, unitOfMeasure, createdAt) VALUES (?, ?, ?, ?, ?)`,
      id, no, name.trim(), unitOfMeasure || 'hour', now
    )
    const rows = await prisma.$queryRawUnsafe<unknown[]>(`SELECT * FROM "ResourceGroup" WHERE id = ?`, id)
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
