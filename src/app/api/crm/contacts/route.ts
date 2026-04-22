export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initCrmTables, cuid } from '@/lib/crm-db'

export async function GET(req: NextRequest) {
  await initCrmTables()
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const type = searchParams.get('type') ?? ''
  const salesperson = searchParams.get('salesperson') ?? ''
  const territory = searchParams.get('territory') ?? ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`
    SELECT * FROM BCContact
    WHERE (${search} = '' OR name LIKE ${'%' + search + '%'} OR email LIKE ${'%' + search + '%'} OR contactNo LIKE ${'%' + search + '%'})
      AND (${type} = '' OR contactType = ${type})
      AND (${salesperson} = '' OR salesperson = ${salesperson})
      AND (${territory} = '' OR territory = ${territory})
    ORDER BY lastModified DESC
  `
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  await initCrmTables()
  const body = await req.json()
  const { name, contactType, companyName, phone, email, salesperson, territory } = body
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const id = cuid()
  const contactNo = 'CT' + Date.now().toString().slice(-6)
  await prisma.$executeRaw`
    INSERT INTO BCContact (id, contactNo, name, contactType, companyName, phone, email, salesperson, territory)
    VALUES (${id}, ${contactNo}, ${name}, ${contactType ?? 'Company'}, ${companyName ?? null},
            ${phone ?? null}, ${email ?? null}, ${salesperson ?? null}, ${territory ?? null})
  `
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`SELECT * FROM BCContact WHERE id = ${id}`
  return NextResponse.json(rows[0], { status: 201 })
}
