import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const themes = await prisma.siteTheme.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(themes)
  } catch (err) {
    console.error('[site/themes GET]', err)
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, primaryColor = '#0078d4', fontFamily = 'Segoe UI', logoUrl, faviconUrl } = body as { name: string; primaryColor?: string; fontFamily?: string; logoUrl?: string; faviconUrl?: string }
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    const theme = await prisma.siteTheme.create({ data: { name: name.trim(), primaryColor, fontFamily, logoUrl: logoUrl || null, faviconUrl: faviconUrl || null, isActive: false } })
    return NextResponse.json(theme, { status: 201 })
  } catch (err) {
    console.error('[site/themes POST]', err)
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 })
  }
}
