import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.$transaction([
      prisma.siteTheme.updateMany({ data: { isActive: false } }),
      prisma.siteTheme.update({ where: { id }, data: { isActive: true } }),
    ])
    const theme = await prisma.siteTheme.findUnique({ where: { id } })
    return NextResponse.json(theme)
  } catch (err) {
    console.error('[site/themes/[id]/activate POST]', err)
    return NextResponse.json({ error: 'Failed to activate theme' }, { status: 500 })
  }
}
