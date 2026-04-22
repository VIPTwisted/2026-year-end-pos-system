import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initCrmTables } from '@/lib/crm-db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initCrmTables()
  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`
    SELECT o.*, c.name AS contactName
    FROM BCOpportunity o
    LEFT JOIN BCContact c ON c.id = o.contactId
    WHERE o.id = ${id}
  `
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initCrmTables()
  const { id } = await params
  const body = await req.json()
  const { description, salesperson, status, stage, probability, estimatedValue, closeDate, campaignId } = body
  await prisma.$executeRaw`
    UPDATE BCOpportunity SET
      description = COALESCE(${description ?? null}, description),
      salesperson = COALESCE(${salesperson ?? null}, salesperson),
      status = COALESCE(${status ?? null}, status),
      stage = COALESCE(${stage ?? null}, stage),
      probability = COALESCE(${probability ?? null}, probability),
      estimatedValue = COALESCE(${estimatedValue ?? null}, estimatedValue),
      closeDate = COALESCE(${closeDate ?? null}, closeDate),
      campaignId = COALESCE(${campaignId ?? null}, campaignId)
    WHERE id = ${id}
  `
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`SELECT * FROM BCOpportunity WHERE id = ${id}`
  return NextResponse.json(rows[0])
}
