import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const templates = await (prisma as any).journalTemplate.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ templates })
  } catch {
    return NextResponse.json({ templates: [] })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, templateType, balAccountType, balAccountNo, noSeries, recurring, sourceCode } = body

  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  try {
    const template = await (prisma as any).journalTemplate.create({
      data: {
        name: name.toUpperCase(),
        description: description || null,
        templateType: templateType ?? 'General',
        balAccountType: balAccountType ?? 'G/L Account',
        balAccountNo: balAccountNo || null,
        noSeries: noSeries || null,
        recurring: recurring ?? false,
        sourceCode: sourceCode || null,
      },
    })
    return NextResponse.json({ template }, { status: 201 })
  } catch (e: any) {
    if (e?.code === 'P2002') return NextResponse.json({ error: 'Template name already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    await (prisma as any).journalTemplate.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
