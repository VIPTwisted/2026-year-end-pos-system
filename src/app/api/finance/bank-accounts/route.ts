import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const type   = searchParams.get('type')

  const accounts = await prisma.bankAccount.findMany({
    where: {
      ...(search ? {
        OR: [
          { accountCode: { contains: search } },
          { bankName: { contains: search } },
          { name: { contains: search } },
        ],
      } : {}),
      ...(type ? { accountType: type } : {}),
    },
    include: {
      glAccount: { select: { code: true, name: true } },
      reconciliations: {
        where: { status: 'completed' },
        orderBy: { statementDate: 'desc' },
        take: 1,
        select: { statementDate: true, statementNo: true },
      },
      _count: { select: { transactions: { where: { isReconciled: false } } } },
    },
    orderBy: { accountCode: 'asc' },
  })

  return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Auto-generate code if not provided
  let accountCode = body.accountCode?.trim()
  if (!accountCode) {
    if (!body.bankName?.trim()) {
      return NextResponse.json({ error: 'bankName is required' }, { status: 400 })
    }
    const count = await prisma.bankAccount.count()
    accountCode = `BANK-${String(count + 1).padStart(4, '0')}`
  }

  if (!body.bankName?.trim()) {
    return NextResponse.json({ error: 'bankName is required' }, { status: 400 })
  }
  if (!body.accountNumber?.trim()) {
    return NextResponse.json({ error: 'accountNumber is required' }, { status: 400 })
  }

  const existing = await prisma.bankAccount.findUnique({ where: { accountCode } })
  if (existing) {
    return NextResponse.json({ error: `No. "${accountCode}" is already in use` }, { status: 409 })
  }

  const account = await prisma.bankAccount.create({
    data: {
      accountCode,
      name:           body.name?.trim() || null,
      bankName:       body.bankName.trim(),
      accountNumber:  body.accountNumber.trim(),
      routingNumber:  body.routingNumber?.trim() || null,
      accountType:    body.accountType ?? 'checking',
      currency:       body.currency ?? 'USD',
      currentBalance: typeof body.currentBalance === 'number' ? body.currentBalance : 0,
      glAccountId:    body.glAccountId ?? null,
      isActive:       typeof body.isActive === 'boolean' ? body.isActive : true,
      isPrimary:      typeof body.isPrimary === 'boolean' ? body.isPrimary : false,
      contactName:    body.contactName?.trim() || null,
      phone:          body.phone?.trim() || null,
      email:          body.email?.trim() || null,
      address:        body.address?.trim() || null,
      city:           body.city?.trim() || null,
      state:          body.state?.trim() || null,
      zip:            body.zip?.trim() || null,
      country:        body.country?.trim() || null,
      swiftCode:      body.swiftCode?.trim() || null,
      ibanNumber:     body.ibanNumber?.trim() || null,
      notes:          body.notes?.trim() || null,
    },
  })

  return NextResponse.json(account, { status: 201 })
}
