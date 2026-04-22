import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const where: Record<string, unknown> = {}
  const severity = searchParams.get('severity'); if (severity) where.severity = severity
  const storeId = searchParams.get('storeId'); if (storeId) where.storeId = storeId
  const isRead = searchParams.get('isRead'); if (isRead !== null) where.isRead = isRead === 'true'
  return NextResponse.json(await prisma.storeAlert.findMany({ where, orderBy: { createdAt: 'desc' } }))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  return NextResponse.json(await prisma.storeAlert.create({
    data: { storeId: body.storeId, storeName: body.storeName, alertType: body.alertType, severity: body.severity ?? 'medium', title: body.title, description: body.description },
  }), { status: 201 })
}
