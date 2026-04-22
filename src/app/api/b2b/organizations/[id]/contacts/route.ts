import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const contacts = await prisma.b2BContact.findMany({
      where: { orgId: id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(contacts)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { firstName, lastName, email, phone, role, isDefault } = body

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'firstName, lastName, email required' }, { status: 400 })
    }

    if (isDefault) {
      await prisma.b2BContact.updateMany({ where: { orgId: id }, data: { isDefault: false } })
    }

    const contact = await prisma.b2BContact.create({
      data: {
        orgId: id,
        firstName,
        lastName,
        email,
        phone: phone ?? null,
        role: role ?? 'buyer',
        isDefault: isDefault ?? false,
      },
    })
    return NextResponse.json(contact, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
