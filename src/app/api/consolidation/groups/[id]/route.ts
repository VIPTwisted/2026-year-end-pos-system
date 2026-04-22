import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const group = await prisma.consolidationGroup.findUnique({
    where: { id },
    include: {
      companies: { orderBy: { companyName: 'asc' } },
      runs: {
        orderBy: { runDate: 'desc' },
        include: { _count: { select: { results: true } } },
      },
    },
  })
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(group)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json()

  const existing = await prisma.consolidationGroup.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.description !== undefined) data.description = body.description
  if (body.currency !== undefined) data.currency = body.currency
  if (body.periodStart !== undefined)
    data.periodStart = body.periodStart ? new Date(body.periodStart) : null
  if (body.periodEnd !== undefined)
    data.periodEnd = body.periodEnd ? new Date(body.periodEnd) : null

  // Add company
  if (body.addCompany) {
    await prisma.consolidationCompany.create({
      data: {
        groupId: id,
        companyCode: body.addCompany.companyCode || body.addCompany.companyName,
        companyName: body.addCompany.companyName,
        currency: body.addCompany.currency || 'USD',
        ownership: Number(body.addCompany.ownershipPct ?? 100),
        consolidationMethod: body.addCompany.consolidationMethod || 'full',
        isActive: body.addCompany.isActive ?? true,
      },
    })
  }

  const group = await prisma.consolidationGroup.update({
    where: { id },
    data,
    include: {
      companies: { orderBy: { companyName: 'asc' } },
      runs: { orderBy: { runDate: 'desc' }, take: 5 },
    },
  })
  return NextResponse.json(group)
}
