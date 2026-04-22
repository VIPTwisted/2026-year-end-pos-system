import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const template = await prisma.financialReportTemplate.findUnique({
    where: { id },
    include: { rows: { orderBy: { rowNo: 'asc' } } },
  })
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(template)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { name, description, type, rows } = body

  const existing = await prisma.financialReportTemplate.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // @ts-ignore
  if (existing.isSystem) return NextResponse.json({ error: 'System templates cannot be modified' }, { status: 403 })

  const template = await prisma.financialReportTemplate.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(rows !== undefined
        ? {
            rows: {
              deleteMany: {},
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
            },
          }
        : {}),
    },
    include: { rows: { orderBy: { rowNo: 'asc' } } },
  })
  return NextResponse.json(template)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const existing = await prisma.financialReportTemplate.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // @ts-ignore
  if (existing.isSystem) return NextResponse.json({ error: 'System templates cannot be deleted' }, { status: 403 })
  await prisma.financialReportTemplate.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
