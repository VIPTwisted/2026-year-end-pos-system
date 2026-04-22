import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isApproved = searchParams.get('isApproved')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search') || ''

    const where: Record<string, unknown> = {}
    if (isApproved !== null && isApproved !== '') where.isApproved = isApproved === 'true'
    if (isActive !== null && isActive !== '') where.isActive = isActive === 'true'
    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { accountCode: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const accounts = await prisma.b2BAccount.findMany({
      where,
      include: {
        _count: { select: { orders: true, portalQuotes: true } },
      },
      orderBy: { companyName: 'asc' },
    })

    return NextResponse.json(accounts)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch B2B accounts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.companyName) {
      return NextResponse.json({ error: 'companyName is required' }, { status: 400 })
    }

    const count = await prisma.b2BAccount.count()
    const accountCode = body.accountCode?.trim() || `B2B-${String(count + 1).padStart(4, '0')}`

    const existing = await prisma.b2BAccount.findUnique({ where: { accountCode } })
    if (existing) {
      return NextResponse.json({ error: `Account code "${accountCode}" already in use` }, { status: 409 })
    }

    const account = await prisma.b2BAccount.create({
      data: {
        accountCode,
        companyName: body.companyName,
        contactName: body.contactName || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || 'US',
        creditLimit: body.creditLimit ?? 0,
        paymentTerms: body.paymentTerms || null,
        priceGroup: body.priceGroup || null,
        notes: body.notes || null,
        isApproved: body.isApproved ?? false,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create B2B account' }, { status: 500 })
  }
}
