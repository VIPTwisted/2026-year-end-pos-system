import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const templates = await prisma.receiptTemplate.findMany({
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    })
    return NextResponse.json(templates)
  } catch (error) {
    console.error('[GET /api/receipt-templates]', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, channelId, channelName, headerText, footerText, showLogo, showBarcode, showLoyalty, showTaxDetail, paperWidth, emailSubject, emailTemplate, isDefault } = body
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }
    if (isDefault) {
      await prisma.receiptTemplate.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
    }
    const template = await prisma.receiptTemplate.create({
      data: {
        name,
        channelId: channelId ?? null,
        channelName: channelName ?? null,
        headerText: headerText ?? null,
        footerText: footerText ?? null,
        showLogo: showLogo ?? true,
        showBarcode: showBarcode ?? true,
        showLoyalty: showLoyalty ?? true,
        showTaxDetail: showTaxDetail ?? true,
        paperWidth: paperWidth ? Number(paperWidth) : 80,
        emailSubject: emailSubject ?? null,
        emailTemplate: emailTemplate ?? null,
        isDefault: isDefault ?? false,
        isActive: true,
      },
    })
    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('[POST /api/receipt-templates]', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
