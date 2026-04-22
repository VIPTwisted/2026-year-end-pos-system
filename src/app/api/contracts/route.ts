import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateContractNo(): string {
  const year = new Date().getFullYear()
  const seq = Date.now().toString().slice(-4).padStart(4, '0')
  return `CON-${year}${seq}`
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const type = sp.get('type')
    const status = sp.get('status')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (status) where.status = status

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        supplier: { select: { id: true, name: true } },
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(contracts)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { lines, ...contractData } = body as {
      lines?: {
        description: string
        unitPrice: number
        quantity: number
        lineTotal: number
        lineType: string
        sortOrder: number
      }[]
      title: string
      type: string
      customerId?: string
      supplierId?: string
      status?: string
      startDate: string
      endDate?: string
      value?: number
      currency?: string
      autoRenew?: boolean
      renewDays?: number
      terms?: string
      notes?: string
    }

    if (!contractData.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!contractData.startDate) {
      return NextResponse.json({ error: 'Start date is required' }, { status: 400 })
    }

    const contractNo = generateContractNo()

    const contract = await prisma.contract.create({
      data: {
        contractNo,
        title: contractData.title.trim(),
        type: contractData.type ?? 'customer',
        customerId: contractData.customerId ?? null,
        supplierId: contractData.supplierId ?? null,
        status: contractData.status ?? 'draft',
        startDate: new Date(contractData.startDate),
        endDate: contractData.endDate ? new Date(contractData.endDate) : null,
        value: contractData.value ?? 0,
        currency: contractData.currency ?? 'USD',
        autoRenew: contractData.autoRenew ?? false,
        renewDays: contractData.renewDays ?? 30,
        terms: contractData.terms ?? null,
        notes: contractData.notes ?? null,
        lines: lines && lines.length > 0
          ? {
              create: lines.map((l, idx) => ({
                description: l.description,
                unitPrice: l.unitPrice ?? 0,
                quantity: l.quantity ?? 1,
                lineTotal: l.lineTotal ?? 0,
                lineType: l.lineType ?? 'service',
                sortOrder: l.sortOrder ?? idx,
              })),
            }
          : undefined,
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        supplier: { select: { id: true, name: true } },
        lines: { orderBy: { sortOrder: 'asc' } },
      },
    })

    return NextResponse.json(contract, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
