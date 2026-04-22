import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const stores = await prisma.fulfillmentGroupStore.findMany({ where: { groupId: id } })
  return NextResponse.json(stores)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const store = await prisma.fulfillmentGroupStore.create({
    data: { groupId: id, storeName: body.storeName, priority: body.priority ?? 1 },
  })
  return NextResponse.json(store, { status: 201 })
}
