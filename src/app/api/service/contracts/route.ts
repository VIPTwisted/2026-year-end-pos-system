import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateContractNumber() {
  const year = new Date().getFullYear()
  const seq = Date.now().toString(36).toUpperCase().slice(-5)
  return `SVC-${year}-${seq}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const customerId = searchParams.get('customerId')

  const contracts = await prisma.serviceContract.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {}),
    },
    include: {
      customer: true,
      serviceItems: true,
      serviceCases: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(contracts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerId, name, status, startDate, endDate, value, billingCycle, description, terms } = body

  if (!customerId || !startDate || !value) {
    return NextResponse.json({ error: 'customerId, startDate, value are required' }, { status: 400 })
  }

  const contract = await prisma.serviceContract.create({
    data: {
      contractNumber: generateContractNumber(),
      name: name ?? `Contract ${generateContractNumber()}`,
      customerId,
      status: status ?? 'active',
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      value: parseFloat(value),
      billingCycle: billingCycle ?? 'monthly',
      description: description ?? null,
      terms: terms ?? null,
    },
    include: { customer: true, serviceItems: true },
  })

  return NextResponse.json(contract, { status: 201 })
}
