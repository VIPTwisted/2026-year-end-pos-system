import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        purchaseOrders: {
          include: { items: true },
        },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(suppliers)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name?: string
      contactName?: string
      email?: string
      phone?: string
      address?: string
      city?: string
      state?: string
      zip?: string
      paymentTerms?: string
      notes?: string
    }

    const { name } = body
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 })
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        contactName: body.contactName?.trim() || null,
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        zip: body.zip?.trim() || null,
        paymentTerms: body.paymentTerms?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
