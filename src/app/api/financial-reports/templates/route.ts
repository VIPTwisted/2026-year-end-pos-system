import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const templates = await prisma.financialReportTemplate.findMany({
    include: { rows: { orderBy: { rowNo: 'asc' } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, type, rows } = body

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const template = await prisma.financialReportTemplate.create({
    data: {
      name,
      description: description ?? null,
      type: type ?? 'income_statement',
      rows: rows?.length
        ? {
            create: rows.map((r: Record<string, unknown>, i: number) => ({
              rowNo: r.rowNo ?? i + 10,
              description: r.description ?? '',
              rowType: r.rowType ?? 'account',
              accountRange: r.accountRange ?? null,
              formula: r.formula ?? null,
              bold: r.bold ?? false,
              underline: r.underline ?? false,
              indent: r.indent ?? 0,
              showOpposite: r.showOpposite ?? false,
            })),
          }
        : undefined,
    },
    include: { rows: { orderBy: { rowNo: 'asc' } } },
  })

  return NextResponse.json(template, { status: 201 })
}
