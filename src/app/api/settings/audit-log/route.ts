import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const tableName = sp.get('tableName')
    const userId = sp.get('userId')
    const action = sp.get('action')

    const where: {
      tableName?: string
      userId?: string
      action?: string
    } = {}

    if (tableName) where.tableName = tableName
    if (userId) where.userId = userId
    if (action) where.action = action

    const records = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    return NextResponse.json({ records })
  } catch (e) {
    console.error('[audit-log GET]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
