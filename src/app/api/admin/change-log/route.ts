import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const table  = searchParams.get('table')  ?? undefined
  const field  = searchParams.get('field')  ?? undefined
  const user   = searchParams.get('user')   ?? undefined
  const from   = searchParams.get('from')
  const to     = searchParams.get('to')

  const where: Record<string, unknown> = {}
  if (table) where.tableCaption = { contains: table }
  if (field) where.fieldName    = { contains: field }
  if (user)  where.userName     = { contains: user }
  if (from || to) {
    where.createdAt = {}
    if (from) (where.createdAt as Record<string,unknown>).gte = new Date(from)
    if (to)   (where.createdAt as Record<string,unknown>).lte = new Date(to)
  }

  const entries = await prisma.adminChangeLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 500,
  })
  return NextResponse.json(entries)
}
