import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const contacts = await prisma.vpVendorContact.findMany({
    where: { vendorId: id },
    orderBy: { role: 'asc' },
  })
  return NextResponse.json(contacts)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  if (!body.firstName || !body.lastName) {
    return NextResponse.json({ error: 'firstName and lastName required' }, { status: 400 })
  }

  const contact = await prisma.vpVendorContact.create({
    data: {
      vendorId:  id,
      firstName: body.firstName,
      lastName:  body.lastName,
      email:     body.email ?? null,
      phone:     body.phone ?? null,
      role:      body.role ?? 'primary',
    },
  })

  return NextResponse.json(contact, { status: 201 })
}
