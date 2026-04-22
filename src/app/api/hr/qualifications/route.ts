import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function ensureTable() {
  try {
    await (prisma as any).$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EmployeeQualification" (
        id TEXT PRIMARY KEY,
        "employeeId" TEXT NOT NULL,
        "employeeName" TEXT,
        "qualificationCode" TEXT NOT NULL,
        description TEXT,
        "fromDate" TEXT,
        "toDate" TEXT,
        type TEXT NOT NULL DEFAULT 'Education',
        institution TEXT,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  } catch { /* already exists */ }
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable()
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId') ?? null

    const rows = employeeId
      ? await (prisma as any).$queryRawUnsafe(
          `SELECT * FROM "EmployeeQualification" WHERE "employeeId" = ? ORDER BY "createdAt" DESC`,
          employeeId
        )
      : await (prisma as any).$queryRawUnsafe(
          `SELECT * FROM "EmployeeQualification" ORDER BY "createdAt" DESC`
        )

    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/hr/qualifications]', err)
    return NextResponse.json({ error: 'Failed to fetch qualifications', detail: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const {
      employeeId,
      employeeName,
      qualificationCode,
      description,
      fromDate,
      toDate,
      type,
      institution,
    } = body as {
      employeeId: string
      employeeName?: string
      qualificationCode: string
      description?: string
      fromDate?: string
      toDate?: string
      type?: string
      institution?: string
    }

    if (!employeeId || !qualificationCode) {
      return NextResponse.json({ error: 'employeeId and qualificationCode are required' }, { status: 400 })
    }

    const id = `eq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO "EmployeeQualification" (id, "employeeId", "employeeName", "qualificationCode", description, "fromDate", "toDate", type, institution)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      employeeId,
      employeeName ?? null,
      qualificationCode.trim(),
      description?.trim() ?? null,
      fromDate ?? null,
      toDate ?? null,
      type ?? 'Education',
      institution?.trim() ?? null,
    )

    const rows = await (prisma as any).$queryRawUnsafe(
      `SELECT * FROM "EmployeeQualification" WHERE id = ?`, id
    )

    return NextResponse.json((rows as unknown[])[0], { status: 201 })
  } catch (err) {
    console.error('[POST /api/hr/qualifications]', err)
    return NextResponse.json({ error: 'Failed to create qualification', detail: String(err) }, { status: 500 })
  }
}
