import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const templateType = searchParams.get('templateType')

    const where: any = { isActive: true }
    if (templateType) where.templateType = templateType

    const templates = await prisma.contentTemplate.findMany({
      where,
      orderBy: [{ isSystem: 'desc' }, { templateName: 'asc' }],
    })
    return NextResponse.json(templates)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { templateId, templateName, templateType, description } = body

    if (!templateId || !templateName || !templateType) {
      return NextResponse.json({ error: 'templateId, templateName, templateType required' }, { status: 400 })
    }

    const template = await prisma.contentTemplate.create({
      data: { templateId, templateName, templateType, description, isSystem: false },
    })
    return NextResponse.json(template, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Template ID already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
