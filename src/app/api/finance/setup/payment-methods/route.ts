import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const methods = await prisma.paymentMethod.findMany({ orderBy: { code: 'asc' } })
    return NextResponse.json(methods)
  } catch (err) {
    console.error('[payment-methods GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const method = await prisma.paymentMethod.create({ data: body })
    return NextResponse.json(method, { status: 201 })
  } catch (err) {
    console.error('[payment-methods POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
