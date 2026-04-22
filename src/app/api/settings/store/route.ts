import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const store = await prisma.store.findFirst({ orderBy: { createdAt: 'asc' } })
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 })
    return NextResponse.json(store)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const store = await prisma.store.findFirst({ orderBy: { createdAt: 'asc' } })
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 })

    const body = await req.json() as Partial<{
      name: string
      address: string
      city: string
      state: string
      zip: string
      phone: string
      email: string
      currency: string
      taxRate: number
      isActive: boolean
    }>

    const data: Prisma.StoreUpdateInput = {}
    if (body.name     !== undefined) data.name     = body.name
    if (body.address  !== undefined) data.address  = body.address
    if (body.city     !== undefined) data.city     = body.city
    if (body.state    !== undefined) data.state    = body.state
    if (body.zip      !== undefined) data.zip      = body.zip
    if (body.phone    !== undefined) data.phone    = body.phone
    if (body.email    !== undefined) data.email    = body.email
    if (body.currency !== undefined) data.currency = body.currency
    if (body.taxRate  !== undefined) data.taxRate  = Number(body.taxRate)
    if (body.isActive !== undefined) data.isActive = body.isActive

    const updated = await prisma.store.update({ where: { id: store.id }, data })
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
