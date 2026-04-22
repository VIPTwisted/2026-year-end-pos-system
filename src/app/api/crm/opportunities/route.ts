export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initCrmTables, cuid } from '@/lib/crm-db'

export async function GET(req: NextRequest) {
  await initCrmTables()
  const { searchParams } = new URL(req.url)
  const salesperson = searchParams.get('salesperson') ?? ''
  const contactId = searchParams.get('contactId') ?? ''
  const status = searchParams.get('status') ?? ''
  const campaignId = searchParams.get('campaignId') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`
    SELECT o.*, c.name AS contactName
    FROM BCOpportunity o
    LEFT JOIN BCContact c ON c.id = o.contactId
    WHERE (${salesperson} = '' OR o.salesperson = ${salesperson})
      AND (${contactId} = '' OR o.contactId = ${contactId})
      AND (${status} = '' OR o.status = ${status})
      AND (${campaignId} = '' OR o.campaignId = ${campaignId})
      AND (${dateFrom} = '' OR o.closeDate >= ${dateFrom})
      AND (${dateTo} = '' OR o.closeDate <= ${dateTo})
    ORDER BY o.createdAt DESC
  `
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  await initCrmTables()
  const body = await req.json()
  const { description, contactId, salesperson, status, stage, probability, estimatedValue, closeDate, campaignId } = body
  if (!description) return NextResponse.json({ error: 'description required' }, { status: 400 })

  const id = cuid()
  const opportunityNo = 'OP' + Date.now().toString().slice(-6)
  await prisma.$executeRaw`
    INSERT INTO BCOpportunity (id, opportunityNo, description, contactId, salesperson, status, stage, probability, estimatedValue, closeDate, campaignId)
    VALUES (${id}, ${opportunityNo}, ${description}, ${contactId ?? null}, ${salesperson ?? null},
            ${status ?? 'Open'}, ${stage ?? null}, ${probability ?? 0}, ${estimatedValue ?? 0},
            ${closeDate ?? null}, ${campaignId ?? null})
  `
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`SELECT * FROM BCOpportunity WHERE id = ${id}`
  return NextResponse.json(rows[0], { status: 201 })
}
