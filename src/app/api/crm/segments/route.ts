import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initCrmTables, cuid } from '@/lib/crm-db'

export async function GET(req: NextRequest) {
  await initCrmTables()
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`
    SELECT s.*,
      (SELECT COUNT(*) FROM BCSegmentContact sc WHERE sc.segmentId = s.id) AS noOfContacts
    FROM BCSegment s
    WHERE (${search} = '' OR s.description LIKE ${'%' + search + '%'} OR s.segmentNo LIKE ${'%' + search + '%'})
    ORDER BY s.createdAt DESC
  `
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  await initCrmTables()
  const body = await req.json()
  const { description, salesperson, segmentDate, campaignId } = body
  if (!description) return NextResponse.json({ error: 'description required' }, { status: 400 })

  const id = cuid()
  const segmentNo = 'SG' + Date.now().toString().slice(-6)
  await prisma.$executeRaw`
    INSERT INTO BCSegment (id, segmentNo, description, salesperson, segmentDate, campaignId)
    VALUES (${id}, ${segmentNo}, ${description}, ${salesperson ?? null},
            ${segmentDate ?? new Date().toISOString().slice(0, 10)}, ${campaignId ?? null})
  `
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`SELECT * FROM BCSegment WHERE id = ${id}`
  return NextResponse.json(rows[0], { status: 201 })
}
