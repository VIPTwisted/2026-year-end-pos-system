import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const template = await prisma.receiptTemplate.findUnique({ where: { id } })
    if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(template)
  } catch (error) {
    console.error('[GET /api/receipt-templates/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    if (body.isDefault) {
      await prisma.receiptTemplate.updateMany({ where: { isDefault: true, id: { not: id } }, data: { isDefault: false } })
    }
    const template = await prisma.receiptTemplate.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.channelName !== undefined ? { channelName: body.channelName } : {}),
        ...(body.headerText !== undefined ? { headerText: body.headerText } : {}),
        ...(body.footerText !== undefined ? { footerText: body.footerText } : {}),
        ...(body.showLogo !== undefined ? { showLogo: body.showLogo } : {}),
        ...(body.showBarcode !== undefined ? { showBarcode: body.showBarcode } : {}),
        ...(body.showLoyalty !== undefined ? { showLoyalty: body.showLoyalty } : {}),
        ...(body.showTaxDetail !== undefined ? { showTaxDetail: body.showTaxDetail } : {}),
        ...(body.paperWidth !== undefined ? { paperWidth: Number(body.paperWidth) } : {}),
        ...(body.emailSubject !== undefined ? { emailSubject: body.emailSubject } : {}),
        ...(body.emailTemplate !== undefined ? { emailTemplate: body.emailTemplate } : {}),
        ...(body.isDefault !== undefined ? { isDefault: body.isDefault } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      },
    })
    return NextResponse.json(template)
  } catch (error) {
    console.error('[PATCH /api/receipt-templates/[id]]', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.receiptTemplate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/receipt-templates/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
