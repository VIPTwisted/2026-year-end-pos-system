import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const contacts = await prisma.cRMContact.findMany({
      where: { accountId: id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(contacts)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const contact = await prisma.cRMContact.create({ data: { ...body, accountId: id } })
    return NextResponse.json(contact, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
