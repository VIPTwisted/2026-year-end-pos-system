import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status') ?? ''
  const customerId = searchParams.get('customerId') ?? ''
  const responsible = searchParams.get('responsible') ?? ''

  let where = 'WHERE 1=1'
  if (search) where += ` AND (j.jobNo LIKE '%${search.replace(/'/g, "''")}%' OR j.description LIKE '%${search.replace(/'/g, "''")}%')`
  if (status) where += ` AND j.status = '${status.replace(/'/g, "''")}'`
  if (customerId) where += ` AND j.customerId = '${customerId.replace(/'/g, "''")}'`
  if (responsible) where += ` AND j.responsible LIKE '%${responsible.replace(/'/g, "''")}%'`

  const jobs = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT j.*, c.firstName, c.lastName FROM "Job" j LEFT JOIN "Customer" c ON c.id = j.customerId ${where} ORDER BY j.createdAt DESC`
  )
  return NextResponse.json(jobs)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { description, customerId, responsible, status, totalContractPrice, totalScheduleCost } = body
    if (!description?.trim()) return NextResponse.json({ error: 'Description is required' }, { status: 400 })

    const year = new Date().getFullYear()
    const prefix = `J${year}-`
    const last = await prisma.$queryRawUnsafe<{ jobNo: string }[]>(
      `SELECT jobNo FROM "Job" WHERE jobNo LIKE '${prefix}%' ORDER BY jobNo DESC LIMIT 1`
    )
    const seq = last.length > 0 ? parseInt(last[0].jobNo.slice(prefix.length)) + 1 : 1
    const jobNo = `${prefix}${String(seq).padStart(4, '0')}`
    const id = randomUUID()
    const now = new Date().toISOString()

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Job" (id, jobNo, description, customerId, responsible, status, percentComplete, totalContractPrice, totalScheduleCost, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      id, jobNo, description.trim(),
      customerId || null,
      responsible?.trim() || null,
      status || 'Planning',
      parseFloat(totalContractPrice) || 0,
      parseFloat(totalScheduleCost) || 0,
      now, now
    )

    const rows = await prisma.$queryRawUnsafe<unknown[]>(`SELECT * FROM "Job" WHERE id = ?`, id)
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
