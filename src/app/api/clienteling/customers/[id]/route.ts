import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await prisma.customerProfile.findUnique({ where: { id } })
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(customer)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const customer = await prisma.customerProfile.update({
    where: { id },
    data: {
      ...(body.customerName !== undefined ? { customerName: body.customerName } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.preferredStore !== undefined ? { preferredStore: body.preferredStore } : {}),
      ...(body.assignedAssociate !== undefined ? { assignedAssociate: body.assignedAssociate } : {}),
      ...(body.tier !== undefined ? { tier: body.tier } : {}),
      ...(body.lifetimeValue !== undefined ? { lifetimeValue: body.lifetimeValue } : {}),
      ...(body.totalOrders !== undefined ? { totalOrders: body.totalOrders } : {}),
      ...(body.avgOrderValue !== undefined ? { avgOrderValue: body.avgOrderValue } : {}),
      ...(body.lastPurchaseDate !== undefined ? { lastPurchaseDate: body.lastPurchaseDate ? new Date(body.lastPurchaseDate) : null } : {}),
      ...(body.birthday !== undefined ? { birthday: body.birthday ? new Date(body.birthday) : null } : {}),
      ...(body.anniversary !== undefined ? { anniversary: body.anniversary ? new Date(body.anniversary) : null } : {}),
      ...(body.preferences !== undefined ? { preferences: typeof body.preferences === 'string' ? body.preferences : JSON.stringify(body.preferences) } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.doNotContact !== undefined ? { doNotContact: body.doNotContact } : {}),
    },
  })
  return NextResponse.json(customer)
}
