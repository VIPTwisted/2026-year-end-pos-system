import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initCrmTables } from '@/lib/crm-db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initCrmTables()
  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`SELECT * FROM BCContact WHERE id = ${id}`
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const interactions: any[] = await prisma.$queryRaw`SELECT * FROM BCInteraction WHERE contactId = ${id} ORDER BY interactionDate DESC LIMIT 10`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opportunities: any[] = await prisma.$queryRaw`SELECT * FROM BCOpportunity WHERE contactId = ${id} ORDER BY createdAt DESC LIMIT 10`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks: any[] = await prisma.$queryRaw`SELECT * FROM BCCrmTask WHERE contactId = ${id} ORDER BY taskDate DESC LIMIT 10`
  return NextResponse.json({ ...rows[0], interactions, opportunities, tasks })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initCrmTables()
  const { id } = await params
  const body = await req.json()
  const { name, contactType, companyName, phone, email, salesperson, territory } = body
  await prisma.$executeRaw`
    UPDATE BCContact SET
      name = COALESCE(${name ?? null}, name),
      contactType = COALESCE(${contactType ?? null}, contactType),
      companyName = COALESCE(${companyName ?? null}, companyName),
      phone = COALESCE(${phone ?? null}, phone),
      email = COALESCE(${email ?? null}, email),
      salesperson = COALESCE(${salesperson ?? null}, salesperson),
      territory = COALESCE(${territory ?? null}, territory),
      lastModified = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw`SELECT * FROM BCContact WHERE id = ${id}`
  return NextResponse.json(rows[0])
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initCrmTables()
  const { id } = await params
  await prisma.$executeRaw`DELETE FROM BCContact WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
