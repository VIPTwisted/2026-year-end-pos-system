import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const contract = await prisma.serviceContract.findUnique({
    where: { id },
    include: {
      customer: true,
      serviceItems: { include: { serviceCases: { orderBy: { createdAt: 'desc' }, take: 5 } } },
      serviceCases: {
        include: { customer: true, partsUsed: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(contract)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { status, endDate, value, billingCycle, description, terms } = body

  const existing = await prisma.serviceContract.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const contract = await prisma.serviceContract.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
      ...(value !== undefined ? { value: parseFloat(value) } : {}),
      ...(billingCycle !== undefined ? { billingCycle } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(terms !== undefined ? { terms } : {}),
    },
    include: { customer: true, serviceItems: true },
  })
  return NextResponse.json(contract)
}
