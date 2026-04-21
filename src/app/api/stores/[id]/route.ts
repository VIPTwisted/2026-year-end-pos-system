import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          orders: true,
          employees: true,
          inventory: true,
        },
      },
      orders: {
        select: { totalAmount: true },
      },
    },
  })

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  return NextResponse.json(store)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const existing = await prisma.store.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  const updatable = [
    'name', 'address', 'city', 'state', 'zip',
    'phone', 'email', 'taxRate', 'isActive',
  ] as const

  type StoreUpdateFields = {
    name?: string
    address?: string
    city?: string
    state?: string
    zip?: string
    phone?: string
    email?: string
    taxRate?: number
    isActive?: boolean
  }

  const data: StoreUpdateFields = {}
  for (const field of updatable) {
    if (field in body) (data as Record<string, unknown>)[field] = body[field]
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
  }

  const store = await prisma.store.update({
    where: { id },
    data,
  })

  return NextResponse.json(store)
}
