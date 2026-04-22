import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const accountType = searchParams.get('accountType')
    const search = searchParams.get('search')
    const where: Record<string, unknown> = {}
    if (accountType && accountType !== 'all') where.accountType = accountType
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }
    const accounts = await prisma.cRMAccount.findMany({
      where,
      include: { _count: { select: { contacts: true, activities: true, notes: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(accounts)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const account = await prisma.cRMAccount.create({ data: body })
    return NextResponse.json(account, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
