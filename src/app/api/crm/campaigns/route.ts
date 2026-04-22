import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initCrmTables, cuid } from '@/lib/crm-db'

export async function GET(req: NextRequest) {
  await initCrmTables()
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const statusCode = searchParams.get('statusCode') ?? ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`
    SELECT c.*,
      (SELECT COUNT(*) FROM BCOpportunity o WHERE o.campaignId = c.id) AS noOfContacts
    FROM BCCampaign c
    WHERE (${search} = '' OR c.description LIKE ${'%' + search + '%'} OR c.campaignNo LIKE ${'%' + search + '%'})
      AND (${statusCode} = '' OR c.statusCode = ${statusCode})
    ORDER BY c.createdAt DESC
  `
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  await initCrmTables()
  const body = await req.json()
  const { description, startingDate, endingDate, statusCode, salesperson } = body
  if (!description) return NextResponse.json({ error: 'description required' }, { status: 400 })

  const id = cuid()
  const campaignNo = 'CP' + Date.now().toString().slice(-6)
  await prisma.$executeRaw`
    INSERT INTO BCCampaign (id, campaignNo, description, startingDate, endingDate, statusCode, salesperson)
    VALUES (${id}, ${campaignNo}, ${description}, ${startingDate ?? null}, ${endingDate ?? null},
            ${statusCode ?? 'Active'}, ${salesperson ?? null})
  `
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`SELECT * FROM BCCampaign WHERE id = ${id}`
  return NextResponse.json(rows[0], { status: 201 })
}
