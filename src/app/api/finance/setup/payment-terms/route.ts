import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const terms = await prisma.paymentTerm.findMany({ orderBy: { code: 'asc' } })
    return NextResponse.json(terms)
  } catch (err) {
    console.error('[payment-terms GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const term = await prisma.paymentTerm.create({ data: body })
    return NextResponse.json(term, { status: 201 })
  } catch (err) {
    console.error('[payment-terms POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
