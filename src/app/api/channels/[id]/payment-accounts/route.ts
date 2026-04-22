import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const accounts = await prisma.channelPaymentAccount.findMany({ where: { channelId: id } })
  return NextResponse.json(accounts)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const account = await prisma.channelPaymentAccount.create({
    data: { channelId: id, accountName: body.accountName, accountType: body.accountType, connectorName: body.connectorName },
  })
  return NextResponse.json(account, { status: 201 })
}
