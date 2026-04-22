import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initCrmTables, cuid } from '@/lib/crm-db'

export async function GET(req: NextRequest) {
  await initCrmTables()
  const { searchParams } = new URL(req.url)
  const contactId = searchParams.get('contactId') ?? ''
  const salesperson = searchParams.get('salesperson') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''
  const template = searchParams.get('template') ?? ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`
    SELECT i.*, c.name AS contactName
    FROM BCInteraction i
    LEFT JOIN BCContact c ON c.id = i.contactId
    WHERE (${contactId} = '' OR i.contactId = ${contactId})
      AND (${salesperson} = '' OR i.initiatedBy = ${salesperson})
      AND (${dateFrom} = '' OR i.interactionDate >= ${dateFrom})
      AND (${dateTo} = '' OR i.interactionDate <= ${dateTo})
      AND (${template} = '' OR i.template = ${template})
    ORDER BY i.interactionDate DESC, i.createdAt DESC
  `
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  await initCrmTables()
  const body = await req.json()
  const { contactId, template, description, cost, duration, initiatedBy, interactionDate } = body

  const id = cuid()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countRows: any[] = await prisma.$queryRaw`SELECT COUNT(*) as cnt FROM BCInteraction`
  const entryNo = (Number(countRows[0]?.cnt ?? 0) + 1)
  const iDate = interactionDate ?? new Date().toISOString().slice(0, 10)

  await prisma.$executeRaw`
    INSERT INTO BCInteraction (id, entryNo, interactionDate, contactId, template, description, cost, duration, initiatedBy)
    VALUES (${id}, ${entryNo}, ${iDate}, ${contactId ?? null}, ${template ?? null},
            ${description ?? null}, ${cost ?? 0}, ${duration ?? 0}, ${initiatedBy ?? 'Us'})
  `
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`SELECT * FROM BCInteraction WHERE id = ${id}`
  return NextResponse.json(rows[0], { status: 201 })
}
