import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const connectors = await prisma.contactCenterConnector.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(connectors)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const connector = await prisma.contactCenterConnector.create({
      data: {
        name: body.name,
        connectorType: body.connectorType,
        status: body.status ?? 'disconnected',
        configJson: body.configJson ?? null,
        syncEnabled: body.syncEnabled ?? false,
      },
    })
    return NextResponse.json(connector, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
