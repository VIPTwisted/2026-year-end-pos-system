import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // 'sheets' | 'updates' | 'ledger'

  try {
    if (type === 'updates') {
      const updates = await prisma.standardCostUpdate.findMany({
        orderBy: { effectiveDate: 'asc' },
        take: 200,
      })
      return NextResponse.json(updates)
    }
    if (type === 'ledger') {
      const entries = await prisma.costAccountingEntry.findMany({
        orderBy: { entryDate: 'desc' },
        take: 300,
      })
      return NextResponse.json(entries)
    }
    // default: costing sheet nodes
    const nodes = await prisma.costingSheetNode.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(nodes)
  } catch {
    return NextResponse.json({ error: 'Costing data unavailable' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  try {
    const body = await req.json()
    if (type === 'update') {
      const record = await prisma.standardCostUpdate.create({ data: body })
      return NextResponse.json(record, { status: 201 })
    }
    if (type === 'ledger') {
      const record = await prisma.costAccountingEntry.create({ data: body })
      return NextResponse.json(record, { status: 201 })
    }
    const node = await prisma.costingSheetNode.create({ data: body })
    return NextResponse.json(node, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 })
  }
}
