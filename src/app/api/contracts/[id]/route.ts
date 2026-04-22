import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        supplier: { select: { id: true, name: true, email: true, phone: true } },
        lines: { orderBy: { sortOrder: 'asc' } },
      },
    })
    if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(contract)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json() as Record<string, unknown>

    const existing = await prisma.contract.findUnique({ where: { id }, select: { status: true } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updateData: Record<string, unknown> = {}

    if (body.status !== undefined) updateData.status = body.status
    if (body.title !== undefined) updateData.title = body.title
    if (body.terms !== undefined) updateData.terms = body.terms
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate as string) : null
    if (body.autoRenew !== undefined) updateData.autoRenew = body.autoRenew
    if (body.renewDays !== undefined) updateData.renewDays = body.renewDays
    if (body.value !== undefined) updateData.value = body.value

    // Sign action: draft → active
    if (body.status === 'active' && body.signedAt) {
      updateData.signedAt = new Date(body.signedAt as string)
    }

    // Terminate action
    if (body.status === 'terminated') {
      updateData.terminatedAt = new Date()
      if (body.terminatedAt) updateData.terminatedAt = new Date(body.terminatedAt as string)
    }

    const contract = await prisma.contract.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        supplier: { select: { id: true, name: true } },
        lines: { orderBy: { sortOrder: 'asc' } },
      },
    })

    return NextResponse.json(contract)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const contract = await prisma.contract.findUnique({ where: { id }, select: { status: true } })
    if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (contract.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft contracts can be deleted' }, { status: 400 })
    }
    await prisma.contract.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
