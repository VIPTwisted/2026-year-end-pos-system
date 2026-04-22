import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const bankAccountId = req.nextUrl.searchParams.get('bankAccountId')
    const reconciliations = await prisma.bankReconciliation.findMany({
      where: bankAccountId ? { bankAccountId } : undefined,
      orderBy: { statementDate: 'desc' },
    })
    return NextResponse.json(reconciliations)
  } catch (err) {
    console.error('[bank-reconciliation GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const recon = await prisma.bankReconciliation.create({ data: body })
    return NextResponse.json(recon, { status: 201 })
  } catch (err) {
    console.error('[bank-reconciliation POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
