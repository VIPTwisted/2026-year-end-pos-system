import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const connectors = await prisma.paymentConnector.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(connectors)
}

export async function POST(req: Request) {
  const body = await req.json()
  const connector = await prisma.paymentConnector.create({
    data: {
      connectorName: body.connectorName,
      connectorType: body.connectorType,
      merchantId: body.merchantId,
      apiEndpoint: body.apiEndpoint,
      supportedMethods: body.supportedMethods,
      isSandbox: body.isSandbox ?? true,
    },
  })
  return NextResponse.json(connector, { status: 201 })
}
