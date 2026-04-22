import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          include: {
            items: {
              include: {
                product: { select: { id: true, name: true, sku: true } },
              },
            },
            store: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    return NextResponse.json(supplier)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      isActive?: boolean
    }

    const existing = await prisma.supplier.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    type SupplierUpdateData = {
      name?: string
      contactName?: string | null
      email?: string | null
      phone?: string | null
      address?: string | null
      city?: string | null
      state?: string | null
      zip?: string | null
      paymentTerms?: string | null
      notes?: string | null
      isActive?: boolean
    }

    const data: SupplierUpdateData = {}
    if ('name' in body && typeof body.name === 'string') data.name = body.name.trim()
    if ('contactName' in body) data.contactName = body.contactName?.trim() || null
    if ('email' in body) data.email = body.email?.trim() || null
    if ('phone' in body) data.phone = body.phone?.trim() || null
    if ('address' in body) data.address = body.address?.trim() || null
    if ('city' in body) data.city = body.city?.trim() || null
    if ('state' in body) data.state = body.state?.trim() || null
    if ('zip' in body) data.zip = body.zip?.trim() || null
    if ('paymentTerms' in body) data.paymentTerms = body.paymentTerms?.trim() || null
    if ('notes' in body) data.notes = body.notes?.trim() || null
    if ('isActive' in body && typeof body.isActive === 'boolean') data.isActive = body.isActive

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data,
    })

    return NextResponse.json(supplier)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          where: { status: { in: ['draft', 'sent', 'acknowledged', 'partial'] } },
          select: { id: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    if (existing.purchaseOrders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot deactivate supplier with open purchase orders' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json(supplier)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
