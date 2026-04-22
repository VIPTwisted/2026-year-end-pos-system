import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initCrmTables, cuid } from '@/lib/crm-db'

export async function GET(req: NextRequest) {
  await initCrmTables()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? ''
  const priority = searchParams.get('priority') ?? ''
  const contactId = searchParams.get('contactId') ?? ''
  const salesperson = searchParams.get('salesperson') ?? ''
  const search = searchParams.get('search') ?? ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`
    SELECT t.*, c.name AS contactName
    FROM BCCrmTask t
    LEFT JOIN BCContact c ON c.id = t.contactId
    WHERE (${status} = '' OR t.status = ${status})
      AND (${priority} = '' OR t.priority = ${priority})
      AND (${contactId} = '' OR t.contactId = ${contactId})
      AND (${salesperson} = '' OR t.salesperson = ${salesperson})
      AND (${search} = '' OR t.description LIKE ${'%' + search + '%'})
    ORDER BY t.taskDate ASC, t.createdAt DESC
  `
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  await initCrmTables()
  const body = await req.json()
  const { description, taskType, contactId, taskDate, status, priority, salesperson } = body
  if (!description) return NextResponse.json({ error: 'description required' }, { status: 400 })

  const id = cuid()
  const taskNo = 'TK' + Date.now().toString().slice(-6)
  await prisma.$executeRaw`
    INSERT INTO BCCrmTask (id, taskNo, description, taskType, contactId, taskDate, status, priority, salesperson)
    VALUES (${id}, ${taskNo}, ${description}, ${taskType ?? 'Phone Call'}, ${contactId ?? null},
            ${taskDate ?? new Date().toISOString().slice(0, 10)}, ${status ?? 'Open'},
            ${priority ?? 'Normal'}, ${salesperson ?? null})
  `
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`SELECT * FROM BCCrmTask WHERE id = ${id}`
  return NextResponse.json(rows[0], { status: 201 })
}
