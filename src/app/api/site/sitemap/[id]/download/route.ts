import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sitemap = await prisma.siteMap.findUnique({ where: { id } })
  if (!sitemap) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!sitemap.generatedXml) {
    return NextResponse.json({ error: 'Sitemap not generated yet' }, { status: 400 })
  }

  return new NextResponse(sitemap.generatedXml, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
      'Content-Disposition': 'attachment; filename=sitemap.xml',
    },
  })
}
