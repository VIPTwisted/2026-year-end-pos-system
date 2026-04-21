import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { opportunities: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(contacts)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, company, title, customerId, notes } = body

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'firstName and lastName are required' }, { status: 400 })
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email: email ?? null,
        phone: phone ?? null,
        company: company ?? null,
        title: title ?? null,
        customerId: customerId ?? null,
        notes: notes ?? null,
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
    })
    return NextResponse.json(contact, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
