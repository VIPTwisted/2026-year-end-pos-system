import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function genAccountNumber() {
  return 'B2B-' + Math.floor(100000 + Math.random() * 900000)
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const orgs = await prisma.b2BOrganization.findMany({
      where: {
        ...(search ? { name: { contains: search } } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        _count: { select: { quotes: true, requisitions: true, contacts: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = orgs.map((o) => ({
      ...o,
      creditAvailable: Math.max(0, o.creditLimit - o.creditUsed),
    }))

    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, creditLimit, paymentTerms, priceGroupId, parentOrgId } = body

    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    let accountNumber = genAccountNumber()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.b2BOrganization.findUnique({ where: { accountNumber } })
      if (!existing) break
      accountNumber = genAccountNumber()
      attempts++
    }

    const org = await prisma.b2BOrganization.create({
      data: {
        name,
        accountNumber,
        creditLimit: creditLimit ?? 0,
        paymentTerms: paymentTerms ?? 'NET30',
        priceGroupId: priceGroupId ?? null,
        parentOrgId: parentOrgId ?? null,
        status: 'active',
      },
    })

    return NextResponse.json(org, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}
