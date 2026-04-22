import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const where = category && category !== 'all' ? { category } : {}
  const templates = await prisma.emailTemplate.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const template = await prisma.emailTemplate.create({
    data: {
      name: body.name,
      category: body.category ?? 'promotional',
      subject: body.subject ?? null,
      htmlBody: body.htmlBody ?? null,
      textBody: body.textBody ?? null,
      previewText: body.previewText ?? null,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(template, { status: 201 })
}
