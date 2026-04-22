import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const account = await prisma.b2BAccount.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { lines: true } } },
        },
        portalQuotes: {
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { lines: true } } },
        },
        _count: { select: { orders: true, portalQuotes: true } },
      },
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const account = await prisma.b2BAccount.update({
      where: { id },
      data: {
        companyName: body.companyName,
        contactName: body.contactName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
        creditLimit: body.creditLimit !== undefined ? Number(body.creditLimit) : undefined,
        paymentTerms: body.paymentTerms,
        priceGroup: body.priceGroup,
        notes: body.notes,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(account)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}
