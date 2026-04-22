import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const accounts = await prisma.chartOfAccount.findMany({ orderBy: { accountCode: 'asc' } })
    return NextResponse.json(accounts)
  } catch (err) {
    console.error('[coa GET]', err)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { accountCode, accountName, accountType, normalBalance, parentCode, isActive, description } = body
    if (!accountCode?.trim() || !accountName?.trim() || !accountType?.trim()) {
      return NextResponse.json({ error: 'accountCode, accountName, and accountType required' }, { status: 400 })
    }
    const account = await prisma.chartOfAccount.create({
      data: {
        accountCode: accountCode.trim(),
        accountName: accountName.trim(),
        accountType: accountType.trim(),
        normalBalance: normalBalance || 'debit',
        parentCode: parentCode || null,
        isActive: isActive !== false,
        description: description || null,
      },
    })
    return NextResponse.json(account, { status: 201 })
  } catch (err) {
    console.error('[coa POST]', err)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
