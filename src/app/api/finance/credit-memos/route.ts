import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const customerId = sp.get('customerId') ?? undefined
    const status = sp.get('status') ?? undefined

    const memos = await prisma.creditMemo.findMany({
      where: {
        ...(customerId ? { customerId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(memos)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      customerId: string
      amount: number
      reason?: string
      returnId?: string
      expiresAt?: string
    }

    const { customerId, amount, reason, returnId, expiresAt } = body

    if (!customerId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'customerId and a positive amount are required' },
        { status: 400 }
      )
    }

    const memoNumber = `CM-${Date.now().toString(36).toUpperCase()}`

    const memo = await prisma.creditMemo.create({
      data: {
        memoNumber,
        customerId,
        amount,
        remaining: amount,
        status: 'open',
        notes: reason ?? null,
        returnId: returnId ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })

    return NextResponse.json(memo, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
