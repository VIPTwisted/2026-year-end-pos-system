import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const org = await prisma.b2BOrganization.findUnique({
      where: { id },
      include: {
        contacts: { orderBy: { createdAt: 'desc' } },
        _count: { select: { quotes: true, requisitions: true } },
        quotes: { orderBy: { createdAt: 'desc' }, take: 10 },
        requisitions: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })
    if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({
      ...org,
      creditAvailable: Math.max(0, org.creditLimit - org.creditUsed),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, creditLimit, creditUsed, paymentTerms, priceGroupId, status, parentOrgId } = body

    const org = await prisma.b2BOrganization.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(creditLimit !== undefined ? { creditLimit } : {}),
        ...(creditUsed !== undefined ? { creditUsed } : {}),
        ...(paymentTerms !== undefined ? { paymentTerms } : {}),
        ...(priceGroupId !== undefined ? { priceGroupId } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(parentOrgId !== undefined ? { parentOrgId } : {}),
      },
    })
    return NextResponse.json({ ...org, creditAvailable: Math.max(0, org.creditLimit - org.creditUsed) })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.b2BOrganization.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 })
  }
}
